import { useEffect, useRef } from "react";
import { LAYER, MAPS, TILE_SIZE } from "@/utils/constants";
import {
  DEFAULT_TEXTURE_PACK_ID,
  getTexturePack,
  packAssetUrl,
} from "@/utils/texturePacks";

type Props = {
  mapName: string;
  // The menu title: the map id is not the name a player sees (arena_map is
  // "Default map").
  title: string;
  // Defaults to the default pack.
  packId?: string;
  className?: string;
};

// The map drawn live from its JSON and the pack's tileset, so the menu follows
// any pack or asset change without a prebuilt image.
export const MapPreview = ({ mapName, title, packId, className }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const map = MAPS[mapName];
  const pack = getTexturePack(packId);

  useEffect(() => {
    // A load that ends after the map or pack changed must not draw.
    let current = true;
    const fallback = packAssetUrl(
      getTexturePack(DEFAULT_TEXTURE_PACK_ID),
      "tileset.png",
    );
    let src = packAssetUrl(pack, "tileset.png");
    const tileset = new Image();

    tileset.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!current || !canvas || !ctx) {
        return;
      }
      const cells = map.layers.find(layer => layer.name === LAYER)?.data ?? [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Reset with every canvas resize, so set it on each draw
      ctx.imageSmoothingEnabled = false;
      for (const [index, id] of cells.entries()) {
        if (id > 0) {
          // The tileset is one row: tile id - 1 is its column
          ctx.drawImage(
            tileset,
            (id - 1) * TILE_SIZE,
            0,
            TILE_SIZE,
            TILE_SIZE,
            (index % map.width) * TILE_SIZE,
            Math.floor(index / map.width) * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE,
          );
        }
      }
    };
    // Same rule as PackImage: the default pack once, no error loop
    tileset.onerror = () => {
      if (current && src !== fallback) {
        src = fallback;
        tileset.src = src;
      }
    };
    tileset.src = src;

    return () => {
      current = false;
    };
  }, [map, pack]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`${title} preview, ${pack.name} pack`}
      width={map.width * TILE_SIZE}
      height={map.height * TILE_SIZE}
      className={className}
      style={{ imageRendering: "pixelated" }}
    />
  );
};
