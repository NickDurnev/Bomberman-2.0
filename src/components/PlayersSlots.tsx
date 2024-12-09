import { PlayerSlotsProps } from "@utils/types";
import { AnimatedTooltip } from "./ui/animated-tooltip";

export const PlayersSlots = ({ max_players, players }: PlayerSlotsProps) => {
    const playerArray = Array.from({ length: max_players }).map((_, index) => {
        const player = players[index];
        return player
            ? { name: player.name, image: player.skin, id: index + 1 }
            : {
                  name: "Empty Slot",
                  image: "/assets/default_avatar.png",
                  id: index + 1,
              };
    });

    return (
        <div className="px-24 text-center motion-preset-expand motion-loop-once">
            <div className="text-2xl font-black drop-shadow-md mb-4">
                Players
            </div>
            <div className="flex flex-row items-center justify-center mb-10 w-full">
                <AnimatedTooltip items={playerArray} />
            </div>
        </div>
    );
};

