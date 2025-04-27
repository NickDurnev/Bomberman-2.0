import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import { Emoji } from "react-apple-emojis";

import { GameSlotsProps } from "@utils/types";
import { colors } from "@utils/constants";
import { getRandomItem } from "@utils/utils";

export function GameSlots({ data, onJoinGame }: GameSlotsProps) {
    const { isAuthenticated } = useAuth0();

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="flex items-start gap-x-2">
                <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
                    Find a game for{" "}
                    <span className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 dark:border-neutral-700 border border-gray-200">
                        Fun
                    </span>{" "}
                    now!
                </h4>
                <Emoji name="bomb" className="pt-2" width={20} />
            </div>
            {isAuthenticated ? (
                <div className="flex justify-center items-center">
                    {data?.map((game) => {
                        if (!game) return null;

                        const COLOR = getRandomItem(colors);

                        return (
                            <motion.div
                                key={game?.id}
                                style={{
                                    rotate: Math.random() * 20 - 10,
                                }}
                                whileHover={{
                                    scale: 1.1,
                                    rotate: 0,
                                    zIndex: 100,
                                }}
                                whileTap={{
                                    scale: 1.1,
                                    rotate: 0,
                                    zIndex: 100,
                                }}
                                className="rounded-xl -mr-4 mt-4 p-1 bg-white dark:bg-neutral-800 dark:border-neutral-700 border border-neutral-100 flex-shrink-0 overflow-hidden"
                            >
                                <button
                                    onClick={() => onJoinGame(game.id)}
                                    className="rounded-lg h-20 w-20 md:h-32 md:w-32 object-cover flex-shrink-0 opacity-90 hover:opacity-100"
                                    style={{
                                        background: COLOR,
                                    }}
                                >
                                    <p className="font-medium text-lg text-white letter-spacing-1 text-center">
                                        {game.name}
                                    </p>
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
                    But first you need to log in
                </h4>
            )}
        </div>
    );
}

