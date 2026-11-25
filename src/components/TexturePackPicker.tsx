import clsx from "clsx";
import { PackImage } from "@/components/index";
import { TEXTURE_PACKS } from "@/utils/texturePacks";

type Props = {
  value: string;
  onChange: (id: string) => void;
};

// Tileset preview tiles: wall, box, floor (tile id - 1)
const PREVIEW_TILES = [0, 4, 5];

// One card per pack: native radios (visually hidden) keep the keyboard and
// screen reader behaviour of a radio group.
export const TexturePackPicker = ({ value, onChange }: Props) => (
  <div
    role="radiogroup"
    aria-label="Texture pack"
    className="grid grid-cols-2 gap-3"
  >
    {TEXTURE_PACKS.map(pack => {
      const selected = value === pack.id;
      return (
        <label
          key={pack.id}
          className={clsx(
            "has-focus-visible:outline-ring flex cursor-pointer flex-col items-center gap-y-2 rounded-lg border-2 p-2 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2",
            selected
              ? "border-primary bg-primary/15 ring-primary/40 ring-2"
              : "border-muted-foreground/30 hover:border-primary/60",
          )}
        >
          <input
            type="radio"
            name="texture-pack"
            value={pack.id}
            checked={selected}
            onChange={() => onChange(pack.id)}
            className="sr-only"
          />
          <span className="flex gap-x-1">
            {PREVIEW_TILES.map(tile => (
              <PackImage
                key={tile}
                packId={pack.id}
                file="tileset.png"
                alt=""
                className="h-7 w-7 object-cover"
                style={{
                  objectPosition: `${(tile / 5) * 100}% 0`,
                  imageRendering: "pixelated",
                }}
              />
            ))}
            <PackImage
              packId={pack.id}
              file="bombs.png"
              alt=""
              className="h-7 w-7 object-cover object-top"
              style={{ imageRendering: "pixelated" }}
            />
          </span>
          <span className={clsx("text-sm", selected && "font-semibold")}>
            {pack.name}
          </span>
        </label>
      );
    })}
  </div>
);
