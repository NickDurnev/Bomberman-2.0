import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { CiLogout } from "react-icons/ci";

import { GameData } from "@utils/types";
import clientSocket from "@utils/socket";
import { getDataFromLocalStorage } from "@utils/local_storage";
import { addUser } from "../../services/auth";

import { Button, GameSlots } from "@components/index";
import DarkModeComponent from "@components/themeBtn";
import NameInput from "./components/NameInput";

const Menu = () => {
    const { loginWithRedirect, logout, user, isAuthenticated, isLoading } =
        useAuth0();
    const navigate = useNavigate();

    const [slotsWithGame, setSlotsWithGame] = useState<GameData[]>([]);
    const [isBtnDisabled, setIsBtnDisabled] = useState(true);

    useEffect(() => {
        // Handle WebSocket events
        clientSocket.on("display pending games", handleDisplayPendingGames);

        // Emit enter lobby event
        clientSocket.emit("enter lobby", handleDisplayPendingGames);

        // Notify other components of scene readiness
        // EventBus.emit("current-scene-ready");

        // Clean up WebSocket listeners on unmount
        return () => {
            clientSocket.off(
                "display pending games",
                handleDisplayPendingGames
            );
        };
    }, []);

    useEffect(() => {
        addUserToDB();
    }, [user]);

    const handleDisplayPendingGames = (availableGames: GameData[]) => {
        setSlotsWithGame((prev) => [
            ...prev,
            availableGames[availableGames.length - 1],
        ]);
    };

    const handleHostGame = () => {
        clientSocket.emit("leave lobby");
        console.log("Navigating to SelectMap...");
        navigate("/map");
    };

    const handleJoinGame = (gameId: string) => {
        clientSocket.emit("leave lobby");
        // Navigate to "PendingGame" with gameId
        console.log("Navigating to PendingGame with game_id:", gameId);
    };

    const addUserToDB = async () => {
        if (user) {
            const res = await addUser({
                email: user.email ?? "",
                name: user.name ?? "",
                picture: user.picture ?? "",
                locale: user.locale ?? "en-US",
                socketID: getDataFromLocalStorage("socket_id"),
            });
            console.log("res:", res);
        }
    };

    return (
        <div id="app" className="w-full h-screen mx-auto ">
            <div className="flex items-center gap-8 justify-end p-6">
                <DarkModeComponent />
                {user ? (
                    <>
                        <Button
                            imageUrl={user.picture}
                            onClick={() => console.log("user:", user)}
                            className="rounded-full p-2"
                        />
                        <Button
                            icon={<CiLogout size={30} />}
                            onClick={() =>
                                logout({
                                    logoutParams: {
                                        returnTo: window.location.origin,
                                    },
                                })
                            }
                            className="rounded-full p-2"
                        />
                    </>
                ) : (
                    <>
                        <Button
                            imageUrl="/assets/google.png"
                            imageAlt="Star icon"
                            onClick={() =>
                                loginWithRedirect({
                                    authorizationParams: {
                                        connection: "google-oauth2",
                                    },
                                })
                            }
                            className="rounded-full p-2"
                        />
                        <Button
                            imageUrl="/assets/github.svg"
                            imageAlt="Star icon"
                            onClick={() =>
                                loginWithRedirect({
                                    authorizationParams: {
                                        connection: "github",
                                    },
                                })
                            }
                            className="rounded-full p-2"
                        />
                    </>
                )}
            </div>
            <div className="pt-20">
                <h1 className="text-8xl font-extrabold tracking-wider text-center motion-preset-expand motion-loop-once">
                    Bomberman 2.0
                </h1>
            </div>
            <div className="mt-20 flex flex-col justify-center items-center mx-auto gap-y-8">
                <NameInput setIsBtnDisabled={setIsBtnDisabled} />
                <Button
                    text="New Game"
                    onClick={handleHostGame}
                    disabled={isBtnDisabled || !isAuthenticated}
                />
                <GameSlots data={slotsWithGame} onJoinGame={handleJoinGame} />
            </div>
        </div>
    );
};

export default Menu;

