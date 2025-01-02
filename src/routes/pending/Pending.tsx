import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import clientSocket from "@utils/socket";
import { Button, PlayersSlots, UserBar } from "@components/index";

interface GameInfo {
    name: string;
    players: Record<string, any>;
    max_players: number;
}

interface GameData {
    current_game: GameInfo;
}

const PendingGame = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);

    useEffect(() => {
        clientSocket.on("update game", handleUpdateGame);
        clientSocket.on("launch game", handleLaunchGame);

        clientSocket.emit("enter pending game", gameId);

        return () => {
            clientSocket.off("update game", handleUpdateGame);
            clientSocket.off("launch game", handleLaunchGame);
        };
    }, [gameId]);

    const handleUpdateGame = (data: GameData) => {
        setGameInfo(data.current_game);
    };

    const handleLaunchGame = (game?: any) => {
        navigate("/game/" + gameId);
    };

    const leaveGameAction = () => {
        clientSocket.emit("leave pending game");
        navigate("/");
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
            <div className="w-full h-full py-20 flex flex-col gap-y-10">
                <div>
                    <h1 className="text-5xl font-extrabold tracking-wider text-center motion-preset-expand motion-loop-once">
                        {gameInfo?.name ?? "Game"}
                    </h1>
                </div>
                <div className="mt-20 flex flex-col justify-center items-center mx-auto gap-y-8">
                    <Button
                        text="Start Game"
                        onClick={startGameAction}
                        // disabled={!canStartGame}
                    />
                    <Button text="Leave Game" onClick={leaveGameAction} />
                </div>
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

