import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import clientSocket from "@utils/socket";
import { EndGame, GameData as Game } from "@utils/types";
import { noKillPhrases } from "@utils/constants";
import { getPlayerVictims, getRandomItem } from "@utils/utils";
import {
    Button,
    Modal,
    ModalContent,
    ModalBody,
    useModal,
    PlayersSlots,
    Table,
    TableBody,
    TableHead,
    TableRow,
    TableHeader,
    TableCell,
    AnimatedTooltip,
} from "@components/index";

type GameData = {
    current_game: Game;
};

const RestartGameModal = () => {
    const [gameInfo, setGameInfo] = useState<Game | null>(null);
    const [prevGameInfo, setPrevGameInfo] = useState<Game | null>(null);
    const [gameId, setGameId] = useState<string | null>(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const navigate = useNavigate();
    const { open, setOpen } = useModal();

    useEffect(() => {
        clientSocket.on("end game", onEndGame);
        clientSocket.on("update game", handleUpdateGame);
        clientSocket.on("launch game", handleLaunchGame);
        clientSocket.on("start timer", () => {
            setIsTimerRunning(true);
        });

        const prevGameInfo = sessionStorage.getItem("prevGameInfo");
        const newGameId = sessionStorage.getItem("new_game_id");
        if (prevGameInfo && newGameId) {
            setTimeout(() => {
                clientSocket.emit("enter pending game", newGameId);
            }, 200);
            const data = JSON.parse(prevGameInfo);
            setPrevGameInfo(data);
            setGameId(newGameId);
            setOpen(true);

            sessionStorage.removeItem("prevGameInfo");
            sessionStorage.removeItem("new_game_id");
        }

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
        sessionStorage.setItem("prevGameInfo", JSON.stringify(prevGameInfo));
        sessionStorage.setItem("new_game_id", new_game_id);
        navigate(0);
    };

    const handleUpdateGame = (data: GameData) => {
        setGameInfo(data.current_game);
    };

    const handleLaunchGame = (game?: Game) => {
        if (!open) {
            return;
        }
        if (gameId || game?.id) {
            const id = gameId || game?.id;
            navigate("/game/" + id);
            setOpen(false);
        }
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

    const getRandomKillPhrase = useCallback(() => {
        return getRandomItem(noKillPhrases);
    }, []);

    return (
        <div className="py-40  flex items-center justify-center">
            <Modal>
                <ModalBody>
                    <ModalContent>
                        <h3 className="text-3xl font-bold tracking-wider text-center motion-preset-expand motion-loop-once">
                            Stats
                        </h3>
                        <div className="pt-5 mb-5 max-h-[325px] overflow-y-auto overflow-x-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">
                                            No.
                                        </TableHead>
                                        <TableHead>Player</TableHead>
                                        <TableHead>Eliminated</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {prevGameInfo &&
                                        prevGameInfo.players.map(
                                            (player, index) => {
                                                const victims =
                                                    getPlayerVictims(
                                                        prevGameInfo,
                                                        player
                                                    );
                                                return (
                                                    <TableRow key={player.id}>
                                                        <TableCell className="font-medium">
                                                            {index + 1}
                                                        </TableCell>
                                                        <TableCell>
                                                            {player.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            {victims.length !==
                                                                0 && (
                                                                <div className="flex flex-row items-center justify-start">
                                                                    <AnimatedTooltip
                                                                        items={
                                                                            victims
                                                                        }
                                                                        size={
                                                                            "small"
                                                                        }
                                                                    />
                                                                </div>
                                                            )}
                                                            {victims.length ===
                                                                0 &&
                                                                getRandomKillPhrase()}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            }
                                        )}
                                </TableBody>
                            </Table>
                        </div>
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
                            <div className="flex flex-col justify-center items-center mx-auto gap-y-8">
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

