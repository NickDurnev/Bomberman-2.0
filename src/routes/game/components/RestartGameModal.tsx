import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
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
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const navigate = useNavigate();
    const { setOpen } = useModal();

    useEffect(() => {
        clientSocket.on("end game", onEndGame);
        clientSocket.on("update game", handleUpdateGame);
        clientSocket.on("launch game", handleLaunchGame);
        clientSocket.on("start timer", () => {
            setIsTimerRunning(true);
        });

        return () => {
            clientSocket.off("end game", onEndGame);
            clientSocket.on("update game", handleUpdateGame);
            clientSocket.on("launch game", handleLaunchGame);
            clientSocket.off("start timer", () => {
                setIsTimerRunning(false);
            });
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

    const startTimer = () => {
        clientSocket.emit("start timer", gameId);
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
                        {isTimerRunning ? (
                            <div className="flex flex-col gap-y-8">
                                <h3 className="text-3xl font-bold tracking-wider text-center motion-preset-expand motion-loop-once">
                                    Game will start in
                                </h3>
                                <div className="flex justify-center">
                                    <CountdownCircleTimer
                                        isPlaying
                                        duration={3}
                                        colors="#8953AD"
                                        strokeWidth={10}
                                        onComplete={() => {
                                            setIsTimerRunning(false);
                                            startGameAction();
                                        }}
                                    >
                                        {({ remainingTime }) => (
                                            <div className="text-4xl font-bold">
                                                {remainingTime}
                                            </div>
                                        )}
                                    </CountdownCircleTimer>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 flex flex-col justify-center items-center mx-auto gap-y-8">
                                <Button
                                    text="Restart Game"
                                    animated
                                    animatedIcon={"💣"}
                                    onClick={startTimer}
                                    // disabled={!canStartGame}
                                />
                                <Button
                                    text="Main Menu"
                                    animated
                                    animatedIcon={"🚪"}
                                    onClick={leaveGameAction}
                                />
                            </div>
                        )}
                    </ModalContent>
                </ModalBody>
            </Modal>
        </div>
    );
};

export default RestartGameModal;

