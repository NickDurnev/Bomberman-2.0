import { motion } from "framer-motion";
import { Emoji } from "react-apple-emojis";
import { MapPreview } from "@/components/MapPreview";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/utils/constants";
import { mapTitle, roomDetails } from "@/utils/room";
import { GameSlotsProps } from "@/utils/types";
import { getRandomItem } from "@/utils/utils";

export function GameSlots({ data, onJoinGame }: GameSlotsProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-start gap-x-2">
        <h4 className="mb-8 text-center text-lg font-bold text-neutral-600 md:text-2xl dark:text-neutral-100">
          Find a game for{" "}
          <span className="rounded-md border border-gray-200 bg-gray-100 px-1 py-0.5 dark:border-neutral-700 dark:bg-neutral-800">
            Fun
          </span>{" "}
          now!
        </h4>
        <Emoji name="bomb" className="pt-2" width={20} />
      </div>
      {isAuthenticated ? (
        <div className="flex max-w-full flex-wrap items-start justify-center gap-4 px-4">
          {data?.map(game => {
            if (!game) {
              return null;
            }

            const COLOR = getRandomItem(colors);
            const detailsId = `room-${game.id}-details`;

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
                className="mt-4 w-32 shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-white p-1 md:w-48 dark:border-neutral-700 dark:bg-neutral-800"
              >
                {/* The button's name stays the room name: the map preview
                    is decorative and the details only describe it. */}
                <button
                  type="button"
                  onClick={() => onJoinGame(game.id)}
                  aria-describedby={detailsId}
                  className="relative flex h-20 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg opacity-90 hover:opacity-100 md:h-32"
                  style={{
                    background: COLOR,
                  }}
                >
                  <div aria-hidden="true" className="absolute inset-0">
                    <MapPreview
                      mapName={game.mapName}
                      title={mapTitle(game.mapName)}
                      packId={game.texturePack}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="letter-spacing-1 relative rounded-md bg-black/60 px-2 text-center text-lg font-medium text-white">
                    {game.name}
                  </p>
                </button>
                <p
                  id={detailsId}
                  className="px-1 pt-1 text-center text-xs text-neutral-600 dark:text-neutral-300"
                >
                  {roomDetails(game).join(" · ")}
                </p>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <h4 className="mb-8 text-center text-lg font-bold text-neutral-600 md:text-2xl dark:text-neutral-100">
          But first you need to log in
        </h4>
      )}
    </div>
  );
}
