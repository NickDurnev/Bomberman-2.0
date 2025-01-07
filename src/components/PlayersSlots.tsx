import { useState, useEffect } from "react";
import { PlayerSlot, Player } from "@utils/types";
import { AnimatedTooltip } from "./ui/animated-tooltip";

type Props = {
    max_players: number;
    players: Player[];
};

export const PlayersSlots = ({ max_players, players }: Props) => {
    const [playersArray, setPlayersArray] = useState<PlayerSlot[]>([]);
    console.log("playersArray:", playersArray);

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
    }, []);

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
        <div className="px-24 text-center motion-preset-expand motion-loop-once">
            <div className="text-2xl font-black drop-shadow-md mb-4">
                Players
            </div>
            <div className="flex flex-row items-center justify-center mb-10 w-full">
                <AnimatedTooltip items={playersArray} />
            </div>
        </div>
    );
};

