import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useLocation } from "react-router-dom";

import { GameData } from "@utils/types";
import clientSocket from "@utils/socket";
import { getDataFromLocalStorage } from "@utils/local_storage";
import { addUser } from "../../services/auth";

import { GameSlots, UserBar, Button } from "@components/index";
import GameForm from "./components/GameForm";

const Menu = () => {
    const { user } = useAuth0();
    const location = useLocation();
    const { pathname } = location;

    const navigate = useNavigate();
    const [slotsWithGame, setSlotsWithGame] = useState<GameData[]>([]);

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
                handleDisplayPendingGames
            );
        };
    }, [pathname]);

    useEffect(() => {
        addUserToDB();
    }, [user]);

    const handleDisplayPendingGames = (availableGames: GameData[]) => {
        console.log("availableGames:", availableGames);
        setSlotsWithGame((prev) => [
            ...prev.filter((game) => {
                return !availableGames.some((g) => g?.id === game?.id);
            }),
            availableGames[availableGames.length - 1],
        ]);
    };

    const handleJoinGame = (game_id: string) => {
        clientSocket.emit("leave lobby");
        navigate("/pending/" + game_id);
    };

    const addUserToDB = async () => {
        if (user) {
            await addUser({
                email: user.email ?? "",
                name: user.name ?? "",
                picture: user.picture ?? "",
                locale: user.locale ?? "en-US",
                socketID: getDataFromLocalStorage("socket_id"),
            });
        }
    };

    return (
        <div id="app" className="w-full h-screen mx-auto">
            <UserBar />
            <div className="pt-20">
                <h1 className="text-8xl font-extrabold text-foreground tracking-wider text-center motion-preset-expand motion-loop-once">
                    Bomberman 2.0
                </h1>
            </div>
            <div className="mt-20 flex flex-col justify-center items-center mx-auto gap-y-8">
                <GameForm />
                <Button
                    text="Stats"
                    onClick={() => navigate("/stats")}
                    animated
                    animatedIcon={"📊"}
                />
                <GameSlots data={slotsWithGame} onJoinGame={handleJoinGame} />
            </div>
        </div>
    );
};

export default Menu;

