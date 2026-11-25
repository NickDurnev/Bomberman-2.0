import { type ImgHTMLAttributes, useState } from "react";
import {
  DEFAULT_TEXTURE_PACK_ID,
  getTexturePack,
  packAssetUrl,
  useActiveTexturePack,
} from "@/utils/texturePacks";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  file: string;
  // Defaults to the pack of the current match.
  packId?: string;
};

// An image from a texture pack. A file the pack lacks (or cannot decode)
// falls back to the default pack once, so the player never sees a broken image.
export const PackImage = ({ file, packId, alt, ...props }: Props) => {
  const activePack = useActiveTexturePack();
  const primary = packAssetUrl(getTexturePack(packId ?? activePack.id), file);
  const fallback = packAssetUrl(getTexturePack(DEFAULT_TEXTURE_PACK_ID), file);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = failedSrc === primary ? fallback : primary;

  return (
    <img
      {...props}
      // By name: Biome useAltText does not see an alt inside the spread
      alt={alt}
      src={src}
      onError={() => {
        // No retry when the default file fails too: no error loop.
        if (src !== fallback) {
          setFailedSrc(primary);
        }
      }}
    />
  );
};
