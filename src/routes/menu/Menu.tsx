import { useAuth } from "@contexts/AuthContext";
import { useEffect, useState } from "react";
import { Emoji } from "react-apple-emojis";
import { useLocation, useNavigate } from "react-router-dom";

import clientSocket, { getOrCreateSocketId } from "@utils/socket";
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
    const { user } = useAuth();
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
                // Guarantee a non-empty name — an empty name is rejected by the
                // server and would silently prevent the account from being created.
                name: user.name?.trim() || user.email?.split("@")[0] || "Player",
                picture: user.picture ?? "",
                locale: user.locale ?? "en-US",
                // Always a valid id (never null), so the signup is never rejected
                // for a missing socketID.
                socketID: getOrCreateSocketId(),
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
