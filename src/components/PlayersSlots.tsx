import { useState, useEffect } from "react";
import { Emoji } from "react-apple-emojis";

import { PlayerSlot, Player } from "@utils/types";
import { AnimatedTooltip } from "./ui/animated-tooltip";

type Props = {
    max_players: number;
    players: Player[];
    size?: "small" | "medium" | "large";
};

export const PlayersSlots = ({
    max_players,
    players,
    size = "medium",
}: Props) => {
    const [playersArray, setPlayersArray] = useState<PlayerSlot[]>([]);

    useEffect(() => {
        const playersArray = Array.from({ length: max_players }, (_, index) => {
            const player = players[index];
            return player
                ? {
                      name: player.name,
                      image: player.skin,
                      id: index + 1,
                  }
                : {
                      name: "Empty Slot",
                      image: "/assets/default_avatar.png",
                      id: index + 1,
                  };
        });

        setPlayersArray(playersArray);
    }, [max_players, players]);

    useEffect(() => {
        setPlayersArray((prev) => {
            return prev.map((player, index) => {
                const newPlayer = players[index];
                return newPlayer
                    ? {
                          name: newPlayer.name,
                          image: newPlayer.skin,
                          id: index + 1,
                      }
                    : player;
            });
        });
    }, [max_players, players]);

    return (
        <div className="px-24 motion-preset-expand motion-loop-once">
            <div className="flex items-start gap-x-2 justify-center">
                <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
                    Need as minimum{" "}
                    <span className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 border border-gray-200">
                        2
                    </span>{" "}
                    players!
                </h4>
                <Emoji name="bomb" className="pt-2" width={20} />
            </div>
            <div className="flex flex-row items-center justify-center mb-10 w-full">
                <AnimatedTooltip items={playersArray} size={size} />
            </div>
        </div>
    );
};

