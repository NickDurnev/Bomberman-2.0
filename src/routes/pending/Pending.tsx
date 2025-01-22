import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import clientSocket from "@utils/socket";
import { GameData as Game } from "@utils/types";
import { Button, PlayersSlots, UserBar } from "@components/index";

interface GameData {
    current_game: Game;
}

const PendingGame = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const [gameInfo, setGameInfo] = useState<Game | null>(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    useEffect(() => {
        clientSocket.on("update game", handleUpdateGame);
        clientSocket.on("launch game", handleLaunchGame);
        clientSocket.on("start timer", () => {
            setIsTimerRunning(true);
        });

        clientSocket.emit("enter pending game", gameId);

        return () => {
            clientSocket.off("update game", handleUpdateGame);
            clientSocket.off("launch game", handleLaunchGame);
            clientSocket.off("start timer", () => {
                setIsTimerRunning(false);
            });
        };
    }, [gameId]);

    const handleUpdateGame = (data: GameData) => {
        console.log("data:", data);
        setGameInfo(data.current_game);
    };

    const handleLaunchGame = () => {
        navigate("/game/" + gameId);
    };

    const leaveGameAction = () => {
        clientSocket.emit("leave pending game");
        navigate("/");
    };

    const startTimer = () => {
        clientSocket.emit("start timer", gameId);
    };

    const startGameAction = () => {
        clientSocket.emit("start game", gameId);
        handleLaunchGame(); // Trigger the game launch
    };

    const players = gameInfo ? Object.values(gameInfo.players) : [];
    const canStartGame = players.length > 1;

    // const renderTime = ({ remainingTime }: { remainingTime: number }) => {
    //     // if (remainingTime === 0) {
    //     //     return <div className="timer">Too lale...</div>;
    //     // }

    //     return <div className="text-4xl font-bold">{remainingTime}</div>;
    // };

    return (
        <>
            <UserBar />
            <div className="w-full h-full py-20 flex flex-col gap-y-10">
                <div>
                    <h1 className="text-5xl font-extrabold tracking-wider text-center motion-preset-expand motion-loop-once">
                        {gameInfo?.name ?? "Game"}
                    </h1>
                </div>
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
                            text="Start Game"
                            animated
                            animatedIcon={"💣"}
                            onClick={startTimer}
                            // disabled={!canStartGame}
                        />
                        <Button
                            text="Leave Game"
                            animated
                            animatedIcon={"🚪"}
                            onClick={leaveGameAction}
                        />
                    </div>
                )}
                {gameInfo && (
                    <PlayersSlots
                        max_players={gameInfo.max_players}
                        players={players}
                    />
                )}
            </div>
        </>
    );
};

export default PendingGame;

