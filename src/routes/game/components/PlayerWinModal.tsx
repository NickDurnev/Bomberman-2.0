import { useEffect } from "react";
import clientSocket from "@utils/socket";
import { Player } from "@utils/types";
import { Modal, ModalContent, ModalBody, useModal } from "@components/index";

const PlayerWinModal = () => {
    useEffect(() => {
        setTimeout(() => {
            clientSocket.on("player win", onPlayerWin);
        }, 3000);
        return () => {
            clientSocket.off("player win", onPlayerWin);
        };
    }, []);

    const onPlayerWin = (winner: Player) => {
        console.log("Winner:", winner);
    };

    return (
        <div className="py-40  flex items-center justify-center">
            <Modal>
                <ModalBody>
                    <ModalContent>
                        <div className="mt-6 flex flex-col justify-center items-center mx-auto gap-y-8">
                            {/* <Button
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
                            /> */}
                        </div>
                    </ModalContent>
                </ModalBody>
            </Modal>
        </div>
    );
};

export default PlayerWinModal;

