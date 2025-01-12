import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import clientSocket from "@utils/socket";
import { EndGame, GameData as Game } from "@utils/types";
import {
    Button,
    Socket,
    Modal,
    ModalTrigger,
    ModalContent,
    ModalFooter,
    ModalBody,
    useModal,
    PlayersSlots,
} from "@components/index";

interface GameData {
    current_game: Game;
}

const RestartGameModal = () => {
    const [gameInfo, setGameInfo] = useState<Game | null>(null);
    const [gameId, setGameId] = useState<string | null>(null);
    const navigate = useNavigate();
    const { setOpen } = useModal();

    useEffect(() => {
        clientSocket.on("end game", onEndGame);
        clientSocket.on("update game", handleUpdateGame);
        clientSocket.on("launch game", handleLaunchGame);

        return () => {
            clientSocket.off("end game", onEndGame);
            clientSocket.on("update game", handleUpdateGame);
            clientSocket.on("launch game", handleLaunchGame);
        };
    }, []);

    const onEndGame = ({ new_game_id }: EndGame) => {
        clientSocket.emit("enter pending game", new_game_id);
        setGameId(new_game_id);
        setOpen(true);
    };

    const handleUpdateGame = (data: GameData) => {
        setGameInfo(data.current_game);
    };

    const handleLaunchGame = () => {
        navigate("/game/" + gameId);
    };

    const startGameAction = () => {
        clientSocket.emit("start game", gameId);
        handleLaunchGame(); // Trigger the game launch
    };

    const players = gameInfo ? Object.values(gameInfo.players) : [];
    const canStartGame = players.length > 1;

    return (
        <div className="py-40  flex items-center justify-center">
            <Modal>
                {/* <ModalTrigger className="bg-black dark:bg-white dark:text-black text-white flex justify-center group/modal-btn">
                    <span className="group-hover/modal-btn:translate-x-40 text-center transition duration-500">
                        Book your flight
                    </span>
                    <div className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
                        ✈️
                    </div>
                </ModalTrigger> */}
                <ModalBody>
                    <ModalContent>
                        {gameInfo && (
                            <PlayersSlots
                                max_players={gameInfo.max_players}
                                players={players}
                                size={"small"}
                            />
                        )}{" "}
                    </ModalContent>
                    <ModalFooter className="gap-4">
                        <div className="mt-20 flex flex-col justify-center items-center mx-auto gap-y-8">
                            <Button
                                text="Start Game"
                                onClick={startGameAction}
                                // disabled={!canStartGame}
                            />
                            {/* <Button
                                text="Leave Game"
                                onClick={leaveGameAction}
                            /> */}
                        </div>
                    </ModalFooter>
                </ModalBody>
            </Modal>
        </div>
    );
};

export default RestartGameModal;

