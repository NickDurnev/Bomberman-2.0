import Phaser from "phaser";
import { EnemyPlayer, Player } from "@/game/entities";
import { TILE_SIZE } from "@/utils/constants";
import { Coordinates, GameData, Player as PlayerType } from "@/utils/types";

interface GameObject extends Phaser.GameObjects.GameObject {
  id: number;
  x: number;
  y: number;
  goTo(newPosition: Coordinates): void;
}

export const findByCoordinates = function (
  col: number,
  row: number,
  entities: Phaser.GameObjects.Group,
): GameObject | null {
  if (!entities) {
    return null;
  }
  const x = col * TILE_SIZE + TILE_SIZE / 2;
  const y = row * TILE_SIZE + TILE_SIZE / 2;
  let result = null;
  entities?.getChildren()?.forEach(entity => {
    const gameObject = entity as GameObject;
    if (gameObject.x === x && gameObject.y === y) {
      result = gameObject;
    }
  });
  return result;
};

export const findAndDestroyByCoordinates = function (
  col: number,
  row: number,
  entities: Phaser.GameObjects.Group,
): void {
  const entity = findByCoordinates(col, row, entities);
  if (!entity) {
    return;
  }

  entity.destroy();
};

export const findById = function (
  id: number | string,
  entities: Phaser.GameObjects.Group,
): GameObject | null {
  if (!entities) {
    return null;
  }
  let result = null;
  entities?.getChildren()?.forEach(entity => {
    const gameObject = entity as GameObject;
    if (gameObject.id === id) {
      result = gameObject;
    }
  });
  return result;
};

export const findAndDestroyById = function (
  id: number | string,
  entities: Phaser.GameObjects.Group,
): void {
  if (!entities || !(entities instanceof Phaser.GameObjects.Group)) {
    console.error(
      "Error: entities is undefined or not a Phaser.GameObjects.Group",
      entities,
    );
    return;
  }

  const entity = findById(id, entities);
  if (!entity) {
    return;
  }

  if (entity instanceof EnemyPlayer || entity instanceof Player) {
    if (entity.playerText) {
      entity.playerText.destroy();
    }
  }

  entity.destroy();
};

export const getRandomItem = (items: string[]) => {
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
};

// Phaser 4 has no geometry masks in WebGL, so a round avatar is a canvas
// texture: the source image, cropped to a centred square, drawn inside a
// circle clip. The texture is created once per key and reused by every
// sprite with the same source.
export function makeRoundTexture(
  scene: Phaser.Scene,
  sourceKey: string,
): string {
  const roundKey = `${sourceKey}_round`;
  if (scene.textures.exists(roundKey)) {
    return roundKey;
  }

  const source = scene.textures.get(sourceKey).getSourceImage() as
    | HTMLImageElement
    | HTMLCanvasElement;
  const side = Math.min(source.width, source.height);
  const texture = scene.textures.createCanvas(roundKey, side, side);
  if (!texture) {
    return sourceKey;
  }

  const context = texture.getContext();
  context.save();
  context.beginPath();
  context.arc(side / 2, side / 2, side / 2, 0, Math.PI * 2);
  context.closePath();
  context.clip();
  context.drawImage(
    source,
    (source.width - side) / 2,
    (source.height - side) / 2,
    side,
    side,
    0,
    0,
    side,
    side,
  );
  context.restore();
  texture.refresh();

  return roundKey;
}

export const setPlayerAvatar = (player: Player | EnemyPlayer, id: string) => {
  // textures.get(id) always returns a truthy object (the __MISSING texture
  // when the skin failed to load), so it can't be used to detect a missing
  // skin — that left players with a broken/empty skin rendering as a black
  // square. Use textures.exists(id), which is false when the load failed, so
  // we correctly fall back to a generated avatar.
  const sourceKey = player.game.textures.exists(id)
    ? id
    : `avatar-${Math.floor(Math.random() * 12) + 1}`;

  const roundKey = makeRoundTexture(player.game, sourceKey);
  player.setTexture(roundKey);
  const textureFrame = player.game.textures.get(roundKey).getSourceImage();
  player.getBody().setSize(textureFrame.width, textureFrame.height);

  // Set the physics body to a circle
  player
    .getBody()
    .setCircle(
      player.getBody().halfWidth,
      0,
      player.getBody().halfHeight - player.getBody().halfWidth,
    );

  // Resize the sprite to fit TILE_SIZE
  const size = TILE_SIZE - 3;
  player.setDisplaySize(size, size);
};

export const getPlayerVictims = (
  prevGameInfo: GameData,
  killer: PlayerType,
) => {
  const victims = prevGameInfo.players.filter(player =>
    killer.kills.includes(player.id),
  );
  const normalizedVictims = victims.map(({ name, skin }, index) => {
    return {
      name,
      image: skin,
      id: index,
    };
  });

  return normalizedVictims;
};

type Procedure<T extends unknown[]> = (...args: T) => void;

export const debounce = <T extends unknown[]>(
  func: Procedure<T>,
  delay: number,
) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export const getIntersectionArea = (
  a: Phaser.GameObjects.GameObject & { body: Phaser.Physics.Arcade.Body },
  b: Phaser.GameObjects.GameObject & { body: Phaser.Physics.Arcade.Body },
) => {
  const rectA = a.body;
  const rectB = b.body;

  const xOverlap = Math.max(
    0,
    Math.min(rectA.right, rectB.right) - Math.max(rectA.left, rectB.left),
  );
  const yOverlap = Math.max(
    0,
    Math.min(rectA.bottom, rectB.bottom) - Math.max(rectA.top, rectB.top),
  );

  return xOverlap * yOverlap;
};
