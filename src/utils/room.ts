import { MAP_TITLES } from "@/utils/constants";
import { getTexturePack } from "@/utils/texturePacks";
import { GameData } from "@/utils/types";

// The map's menu name; the id of a map this client does not know
export const mapTitle = (mapName: string): string =>
  MAP_TITLES[mapName] ?? mapName;

// What a player joins: map, texture pack and the host's options
export const roomDetails = (game: GameData): string[] => {
  const details = [
    mapTitle(game.mapName),
    `${getTexturePack(game.texturePack).name} pack`,
  ];
  if (game.isPortalsEnabled) {
    details.push("Portals");
  }
  if (game.isDelaySpoilEnabled) {
    details.push("Delay spoil");
  }
  return details;
};
