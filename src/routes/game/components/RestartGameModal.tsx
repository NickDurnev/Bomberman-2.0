import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clientSocket from "@utils/socket";
import { EndGame, GameData as Game } from "@utils/types";
import {
    Button,
    Modal,
    ModalContent,
    ModalBody,
    useModal,
    PlayersSlots,
} from "@components/index";

type GameData = {
    current_game: Game;
};

const RestartGameModal = () => {
    const [gameInfo, setGameInfo] = useState<Game | null>(null);
    const [gameId, setGameId] = useState<string | null>(null);
    const navigate = useNavigate();
    const { setOpen } = useModal();

    useEffect(() => {
        setTimeout(() => {
            clientSocket.on("end game", onEndGame);
            clientSocket.on("update game", handleUpdateGame);
            clientSocket.on("launch game", handleLaunchGame);
        }, 3000);
        return () => {
            clientSocket.off("end game", onEndGame);
            clientSocket.on("update game", handleUpdateGame);
            clientSocket.on("launch game", handleLaunchGame);
        };
    }, []);

    const onEndGame = ({ new_game_id, prevGameInfo }: EndGame) => {
        console.log("prevGameInfo:", prevGameInfo);
        clientSocket.emit("enter pending game", new_game_id);
        setGameId(new_game_id);
        setOpen(true);
    };

    const handleUpdateGame = (data: GameData) => {
        setGameInfo(data.current_game);
    };

    const handleLaunchGame = (game?: Game) => {
        if (gameId || game?.id) {
            const id = gameId || game?.id;
            navigate("/game/" + id);
        }
        setOpen(false);
    };

    const startGameAction = () => {
        clientSocket.emit("start game", gameId);
        handleLaunchGame(); // Trigger the game launch
    };

    const leaveGameAction = () => {
        clientSocket.emit("leave pending game");
        navigate("/");
    };

    const players = gameInfo ? Object.values(gameInfo.players) : [];
    const canStartGame = players.length > 1;

    return (
        <div className="py-40  flex items-center justify-center">
            <Modal>
                <ModalBody>
                    <ModalContent>
                        {gameInfo && (
                            <PlayersSlots
                                max_players={gameInfo.max_players}
                                players={players}
                                size={"small"}
                            />
                        )}
                        <div className="mt-6 flex flex-col justify-center items-center mx-auto gap-y-8">
                            <Button
                                text="Restart Game"
                                animated
                                animatedIcon={"💣"}
                                onClick={startGameAction}
                                // disabled={!canStartGame}
                            />
                            <Button
                                text="Main Menu"
                                animated
                                animatedIcon={"🚪"}
                                onClick={leaveGameAction}
                            />
                        </div>
                    </ModalContent>
                </ModalBody>
            </Modal>
        </div>
    );
};

export default RestartGameModal;

