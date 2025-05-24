import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import { Emoji } from "react-apple-emojis";

import { colors } from "@utils/constants";
import { GameSlotsProps } from "@utils/types";
import { getRandomItem } from "@utils/utils";

export function GameSlots({ data, onJoinGame }: GameSlotsProps) {
    const { isAuthenticated } = useAuth0();

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="flex items-start gap-x-2">
                <h4 className="mb-8 text-center font-bold text-lg text-neutral-600 md:text-2xl dark:text-neutral-100">
                    Find a game for{" "}
                    <span className="rounded-md border border-gray-200 bg-gray-100 px-1 py-0.5 dark:border-neutral-700 dark:bg-neutral-800">
                        Fun
                    </span>{" "}
                    now!
                </h4>
                <Emoji name="bomb" className="pt-2" width={20} />
            </div>
            {isAuthenticated ? (
                <div className="flex items-center justify-center">
                    {data?.map((game) => {
                        if (!game) {
                            return null;
                        }

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
                                className="-mr-4 mt-4 flex-shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-800"
                            >
                                <button
                                    onClick={() => onJoinGame(game.id)}
                                    className="h-20 w-20 flex-shrink-0 rounded-lg object-cover opacity-90 hover:opacity-100 md:h-32 md:w-32"
                                    style={{
                                        background: COLOR,
                                    }}
                                >
                                    <p className="letter-spacing-1 text-center font-medium text-lg text-white">
                                        {game.name}
                                    </p>
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <h4 className="mb-8 text-center font-bold text-lg text-neutral-600 md:text-2xl dark:text-neutral-100">
                    But first you need to log in
                </h4>
            )}
        </div>
    );
}

