import { useSyncExternalStore } from "react";

// basePath has no leading or trailing slash: Phaser loads it against
// load.baseURL "/", React gets it through packAssetUrl.
export type TexturePack = { id: string; name: string; basePath: string };

// The fallback for a missing file, so this pack must stay complete.
export const DEFAULT_TEXTURE_PACK_ID = "default";

const DEFAULT_PACK: TexturePack = {
  id: DEFAULT_TEXTURE_PACK_ID,
  name: "Default",
  basePath: "assets/packs/default",
};

// Add a pack: a folder under public/assets/packs/<id>/ with the files of
// docs/assets.md › Texture packs, plus one entry here. Keep the ids equal to
// TEXTURE_PACKS in Bomberman-2.0-Backend/src/constants.ts.
export const TEXTURE_PACKS: readonly TexturePack[] = [
  DEFAULT_PACK,
  { id: "classic", name: "Classic", basePath: "assets/packs/classic" },
];

export function isTexturePackId(value: unknown): value is string {
  return TEXTURE_PACKS.some(pack => pack.id === value);
}

// Unknown or missing id (an older server) → default pack.
export function getTexturePack(id: string | undefined): TexturePack {
  return TEXTURE_PACKS.find(pack => pack.id === id) ?? DEFAULT_PACK;
}

// Game registry key: the pack id each pack texture was loaded from (null when
// missing). Preload writes it, the E2E hook reads it.
export const TEXTURE_SOURCES_KEY = "textureSources";

export function packAssetUrl(pack: TexturePack, file: string): string {
  return `/${pack.basePath}/${file}`;
}

// The pack of the current match (the room's Game.texturePack), for the React
// HUD. PhaserGame sets it before Preload loads the pack textures.
let activePack = DEFAULT_PACK;

const listeners = new Set<() => void>();

export function setActiveTexturePack(id: string | undefined): void {
  const next = getTexturePack(id);
  if (next === activePack) {
    return;
  }
  activePack = next;
  for (const listener of listeners) {
    listener();
  }
}

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
};

const getActivePack = () => activePack;

export function useActiveTexturePack(): TexturePack {
  return useSyncExternalStore(subscribe, getActivePack, getActivePack);
}
