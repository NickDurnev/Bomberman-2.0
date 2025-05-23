import { useEffect, useState } from "react";
import { Emoji } from "react-apple-emojis";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { IoIosAlert } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";

import { Button, PlayersSlots, UserBar } from "@components/index";
import {
    POINTS_PER_KILL,
    POINTS_PER_TOP3,
    POINTS_PER_WIN,
    TUTORIAL,
} from "@utils/constants";
import clientSocket from "@utils/socket";
import { GameData as Game } from "@utils/types";

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
        setGameInfo(data.current_game);
    };

    const handleLaunchGame = () => {
        navigate(`/game/${gameId}`);
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

    return (
        <>
            <UserBar />
            <div className="flex h-full w-full flex-col gap-y-10 py-10">
                <div>
                    <h1 className="motion-preset-expand motion-loop-once text-center font-extrabold text-5xl tracking-wider">
                        {gameInfo?.name ?? "Game"}
                    </h1>
                </div>
                {isTimerRunning ? (
                    <div className="flex flex-col gap-y-8">
                        <h3 className="motion-preset-expand motion-loop-once text-center font-bold text-3xl tracking-wider">
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
                                    <div className="font-bold text-4xl">
                                        {remainingTime}
                                    </div>
                                )}
                            </CountdownCircleTimer>
                        </div>
                    </div>
                ) : (
                    <div className="mx-auto mt-6 flex flex-col items-center justify-center gap-y-8">
                        <Button
                            text="Start Game"
                            animated
                            animatedIcon={<Emoji name="bomb" width={20} />}
                            onClick={startTimer}
                            disabled={!canStartGame}
                        />
                        <Button
                            text="Leave Game"
                            animated
                            animatedIcon={<Emoji name="door" width={20} />}
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
                <div className="motion-preset-expand motion-loop-once mx-auto flex w-1/2 items-start justify-center gap-x-2 rounded-lg bg-modal p-2 text-white">
                    <IoIosAlert size={40} />
                    <div>
                        <p className="font-medium">{TUTORIAL.actions}</p>
                        <p className="font-medium">
                            <span className="font-bold">
                                {POINTS_PER_WIN} points
                            </span>{" "}
                            {TUTORIAL.earningPoints.wins}
                        </p>
                        <p className="font-medium">
                            <span className="font-bold">
                                {POINTS_PER_TOP3} point
                            </span>{" "}
                            {TUTORIAL.earningPoints.top3}
                        </p>
                        <p className="font-medium">
                            <span className="font-bold">
                                {POINTS_PER_KILL} point
                            </span>{" "}
                            {TUTORIAL.earningPoints.kills}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PendingGame;
