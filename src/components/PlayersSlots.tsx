import { useEffect, useState } from "react";
import { Emoji } from "react-apple-emojis";

import { Player, PlayerSlot } from "@utils/types";
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
        <div className="motion-preset-expand motion-loop-once px-24">
            <div className="flex items-start justify-center gap-x-2">
                <h4 className="mb-8 text-center font-bold text-lg text-neutral-600 md:text-2xl dark:text-neutral-100">
                    Need as minimum{" "}
                    <span className="rounded-md border border-gray-200 bg-gray-100 px-1 py-0.5 dark:border-neutral-700 dark:bg-neutral-800">
                        2
                    </span>{" "}
                    players!
                </h4>
                <Emoji name="bomb" className="pt-2" width={20} />
            </div>
            <div className="mb-10 flex w-full flex-row items-center justify-center">
                <AnimatedTooltip items={playersArray} size={size} />
            </div>
        </div>
    );
};

