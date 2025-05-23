import { useEffect, useState } from "react";
import clientSocket from "@utils/socket";
import { Player, PlayerWin, PlayerSlot } from "@utils/types";
import { getPlayerVictims } from "@utils/utils";
import {
    Modal,
    ModalContent,
    ModalBody,
    useModal,
    ColourfulText,
    AnimatedTooltip,
} from "@components/index";

const PlayerWinModal = () => {
    const [victims, setVictims] = useState<PlayerSlot[]>([]);
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

    const onPlayerWin = ({ winner, prevGameInfo }: PlayerWin) => {
        const victims = getPlayerVictims(prevGameInfo, winner);
        setVictims(victims);

        setWinner(winner);
        setOpen(true);
    };

    return (
        <div className="py-40  flex items-center justify-center">
            <Modal>
                <ModalBody>
                    <ModalContent>
                        {winner && (
                            <div className="mt-6 flex flex-col justify-center items-center mx-auto gap-y-8">
                                <img
                                    src={winner.skin}
                                    alt={winner.name}
                                    className="w-32 h-32 rounded-full motion-preset-confetti motion-loop-once"
                                />
                                <h3 className="text-3xl font-bold tracking-wider text-center motion-preset-expand motion-loop-once">
                                    Winner{" "}
                                    <ColourfulText
                                        text={winner.name}
                                        colors={["#8852AC"]}
                                    />
                                </h3>
                                {victims.length !== 0 && (
                                    <h4 className="text-2xl font-bold tracking-wider text-center">
                                        Eliminated:
                                    </h4>
                                )}
                                <div className="flex flex-row items-center justify-center mb-10 w-full">
                                    {victims.length !== 0 && (
                                        <AnimatedTooltip
                                            items={victims}
                                            size={"medium"}
                                        />
                                    )}
                                    {victims.length === 0 && (
                                        <p className="text-xl font-semibold text-center">
                                            {winner.noKillPhrase}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </ModalContent>
                </ModalBody>
            </Modal>
        </div>
    );
};

export default PlayerWinModal;

