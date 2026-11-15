import { useEffect, useState } from "react";
import {
  AnimatedTooltip,
  ColourfulText,
  fallbackAvatar,
  Modal,
  ModalBody,
  ModalContent,
  useModal,
} from "@/components/index";
import clientSocket from "@/utils/socket";
import { Player, PlayerSlot, PlayerWin } from "@/utils/types";
import { getPlayerVictims } from "@/utils/utils";

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

    // Only the players in prevGameInfo carry the noKillPhrase.
    const winnerInfo = prevGameInfo.players.find(
      player => player.id === winner.id,
    );
    setWinner(winnerInfo ?? winner);
    setOpen(true);
  };

  return (
    <div className="absolute">
      <Modal>
        <ModalBody className="[@media(max-height:500px)]:max-h-[95dvh]! [@media(max-height:500px)]:min-h-0! [@media(max-height:500px)]:max-w-[80%]!">
          <ModalContent className="min-h-0 overflow-y-auto *:shrink-0 [@media(max-height:500px)]:p-4!">
            {winner && (
              <div className="mx-auto mt-6 flex flex-col items-center justify-center gap-y-8 [@media(max-height:500px)]:mt-0 [@media(max-height:500px)]:gap-y-3">
                <img
                  src={winner.skin || fallbackAvatar(winner.name)}
                  onError={e => {
                    const fallback = fallbackAvatar(winner.name);
                    if (!e.currentTarget.src.endsWith(fallback)) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                  alt={winner.name}
                  className="motion-preset-confetti motion-loop-once h-32 w-32 rounded-full [@media(max-height:500px)]:h-16 [@media(max-height:500px)]:w-16"
                />
                <h3 className="motion-preset-expand motion-loop-once text-center text-3xl font-bold tracking-wider">
                  Winner{" "}
                  <ColourfulText text={winner.name} colors={["#8852AC"]} />
                </h3>
                {victims.length !== 0 && (
                  <h4 className="text-center text-2xl font-bold tracking-wider">
                    Eliminated:
                  </h4>
                )}
                <div className="mb-10 flex w-full flex-row items-center justify-center [@media(max-height:500px)]:mb-2">
                  {victims.length !== 0 && (
                    <AnimatedTooltip items={victims} size={"medium"} />
                  )}
                  {victims.length === 0 && (
                    <p className="text-center text-xl font-semibold">
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
