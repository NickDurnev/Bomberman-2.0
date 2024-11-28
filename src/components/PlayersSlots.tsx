import { PlayerSlotsProps } from "@utils/types";

export const PlayersSlots = ({
    max_players,
    players,
    asset_empty,
    asset_player,
}: PlayerSlotsProps) => (
    <div className="player-slots text-center">
        {/* Title */}
        <div className="text-2xl font-black text-gray-200 drop-shadow-md mb-4">
            Players
        </div>

        {/* Container for slots */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-black bg-opacity-50 p-4 rounded-lg mx-auto w-96 h-[350px] overflow-hidden">
            {Array.from({ length: max_players }).map((_, index) => {
                const player = players[index];
                const isEmpty = !player;

                return (
                    <div
                        key={index}
                        className="flex flex-col items-center space-y-2"
                    >
                        {/* Slot Image */}
                        <img
                            src={
                                isEmpty
                                    ? asset_empty
                                    : `${asset_player}${player.skin}`
                            }
                            alt={
                                isEmpty ? "Empty Slot" : `Player ${player.skin}`
                            }
                            className="w-20 h-20 object-contain"
                        />

                        {/* Player Name */}
                        {!isEmpty && (
                            <div className="text-lg font-semibold text-gray-200">
                                {player.skin}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
);

