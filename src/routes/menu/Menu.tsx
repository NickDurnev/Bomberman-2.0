import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { Emoji } from "react-apple-emojis";
import { useLocation, useNavigate } from "react-router-dom";

import { SOCKET_ID_KEY } from "@utils/constants";
import { getDataFromLocalStorage } from "@utils/local_storage";
import clientSocket from "@utils/socket";
import { GameData } from "@utils/types";

import {
    Button,
    GameSlots,
    TextGenerateEffect,
    UserBar,
} from "@components/index";
import { addUser } from "../../services/auth";
import GameForm from "./components/GameForm";

const Menu = () => {
    const { user } = useAuth0();
    const location = useLocation();
    const navigate = useNavigate();

    const [slotsWithGame, setSlotsWithGame] = useState<GameData[]>([]);
    const { pathname } = location;

    useEffect(() => {
        setSlotsWithGame([]);
        // Handle WebSocket events
        clientSocket.on("display pending games", handleDisplayPendingGames);

        // Emit enter lobby event
        clientSocket.emit("enter lobby", handleDisplayPendingGames);

        // Clean up WebSocket listeners on unmount
        return () => {
            clientSocket.off(
                "display pending games",
                handleDisplayPendingGames,
            );
        };
    }, [pathname]);

    useEffect(() => {
        addUserToDB();
    }, [user]);

    const handleDisplayPendingGames = (availableGames: GameData[]) => {
        if (availableGames.length) {
            setSlotsWithGame((prev) => [
                ...prev.filter((game) => {
                    return !availableGames.some((g) => g?.id === game?.id);
                }),
                availableGames[availableGames.length - 1],
            ]);
        } else {
            setSlotsWithGame([]);
        }
    };

    const handleJoinGame = (game_id: string) => {
        clientSocket.emit("leave lobby");
        navigate(`/pending/${game_id}`);
    };

    const addUserToDB = async () => {
        if (user) {
            await addUser({
                email: user.email ?? "",
                name: user.name ?? "",
                picture: user.picture ?? "",
                locale: user.locale ?? "en-US",
                socketID: getDataFromLocalStorage(SOCKET_ID_KEY),
            });
        }
    };

    return (
        <div id="app" className="mx-auto h-screen w-full">
            <UserBar />
            <div className="pt-20">
                <TextGenerateEffect
                    words="Bomberman"
                    duration={2.0}
                    className="text-center font-extrabold text-8xl text-foreground tracking-wider"
                />
            </div>
            <div className="mx-auto mt-20 flex flex-col items-center justify-center gap-y-8">
                <GameForm />
                <Button
                    text="Stats"
                    onClick={() => navigate("/stats")}
                    animated
                    animatedIcon={<Emoji name="bar-chart" width={20} />}
                />
                <GameSlots data={slotsWithGame} onJoinGame={handleJoinGame} />
            </div>
        </div>
    );
};

export default Menu;
