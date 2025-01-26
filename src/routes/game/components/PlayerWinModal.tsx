import { useEffect, useState } from "react";
import clientSocket from "@utils/socket";
import { Player } from "@utils/types";
import { Modal, ModalContent, ModalBody, useModal } from "@components/index";

const PlayerWinModal = () => {
    const [winner, setWinner] = useState<Player | null>(null);
    const { setOpen } = useModal();

    useEffect(() => {
        setTimeout(() => {
            clientSocket.on("end game", onEndGame);
            clientSocket.on("player win", onPlayerWin);
        }, 3000);
        return () => {
            clientSocket.off("end game", onEndGame);
            clientSocket.off("player win", onPlayerWin);
        };
    }, []);

    const onEndGame = () => {
        setOpen(false);
    };

    const onPlayerWin = (winner: Player) => {
        console.log("Winner:", winner);
        setWinner(winner);
        setOpen(true);
    };

    return (
        <div className="py-40  flex items-center justify-center">
            <Modal>
                <ModalBody>
                    <ModalContent>
                        <div className="mt-6 flex flex-col justify-center items-center mx-auto gap-y-8 motion-preset-confetti motion-loop-once">
                            {winner && (
                                <>
                                    <img
                                        src={winner.skin}
                                        alt={winner.name}
                                        className="w-32 h-32 rounded-full"
                                    />
                                    <h3 className="text-3xl font-bold tracking-wider text-center motion-preset-expand motion-loop-once">
                                        Player {winner.name} has won the game!
                                    </h3>
                                    <h4 className="text-2xl font-bold tracking-wider text-center motion-preset-expand motion-loop-once">
                                        Kills: {winner.kills}
                                    </h4>
                                </>
                            )}
                        </div>
                    </ModalContent>
                </ModalBody>
            </Modal>
        </div>
    );
};

export default PlayerWinModal;

