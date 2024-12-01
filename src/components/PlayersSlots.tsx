import { FaUser } from "react-icons/fa";
import { PlayerSlotsProps } from "@utils/types";

export const PlayersSlots = ({ max_players, players }: PlayerSlotsProps) => (
    <div className="player-slots text-center">
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
                        {!isEmpty ? (
                            <>
                                <img
                                    src={player.skin}
                                    alt={player.name}
                                    className="w-20 h-20 object-contain rounded-full"
                                />
                                <div className="text-lg font-semibold text-gray-200">
                                    {player.name}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 flex items-center justify-center bg-slate-500 rounded-full">
                                    <FaUser className="w-14 h-14 text-gray-200" />
                                </div>
                                <div className="text-lg font-semibold text-gray-200">
                                    Empty Slot
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
);

