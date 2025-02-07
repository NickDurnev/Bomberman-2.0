import { Spawn, GameData, Player as PlayerType } from "@utils/types";
import { TILE_SIZE } from "./constants";
import Player from "@game/entities/player";
import EnemyPlayer from "@game/entities/enemy_player";
interface GameObject extends Phaser.GameObjects.GameObject {
    id: number;
    x: number;
    y: number;
    goTo(newPosition: Spawn): void;
}

export const findByCoordinates = function (
    col: number,
    row: number,
    entities: Phaser.GameObjects.Group
): GameObject | null {
    if (!entities) {
        return null;
    }
    const x = col * TILE_SIZE + TILE_SIZE / 2;
    const y = row * TILE_SIZE + TILE_SIZE / 2;
    let result = null;
    entities?.getChildren()?.forEach((entity) => {
        console.log("entity:", entity);
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
    entities: Phaser.GameObjects.Group
): void {
    const entity = findByCoordinates(col, row, entities);
    if (!entity) {
        return;
    }

    entity.destroy();
};

export const findById = function (
    id: number | string,
    entities: Phaser.GameObjects.Group
): GameObject | null {
    if (!entities) {
        return null;
    }
    let result = null;
    entities?.getChildren()?.forEach((entity) => {
        const gameObject = entity as GameObject;
        if (gameObject.id === id) {
            result = gameObject;
        }
    });
    return result;
};

export const findAndDestroyById = function (
    id: number | string,
    entities: Phaser.GameObjects.Group
): void {
    const entity = findById(id, entities);
    if (!entity) {
        return;
    }

    entity.destroy();
};

export const getRandomItem = (items: string[]) => {
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
};

export const setPlayerAvatar = (player: Player | EnemyPlayer, id: string) => {
    if (player.game.textures.get(id)) {
        player.setTexture(id);

        // Get texture size
        const textureFrame = player.game.textures.get(id).getSourceImage();
        const textureWidth = textureFrame.width;
        const textureHeight = textureFrame.height;

        player.getBody().setSize(textureWidth, textureHeight);
    } else {
        const randomNumber = Math.floor(Math.random() * 12) + 1;
        player.setTexture(`avatar-${randomNumber}`);

        const randomTextureFrame = player.game.textures
            .get(`avatar-${randomNumber}`)
            .getSourceImage();
        const randomTextureWidth = randomTextureFrame.width;
        const randomTextureHeight = randomTextureFrame.height;

        player.getBody().setSize(randomTextureWidth, randomTextureHeight);
    }

    // Set the physics body to a circle
    const size = TILE_SIZE - 3;
    const radius = size / 2; // Ensure the radius matches TILE_SIZE
    player
        .getBody()
        .setCircle(
            player.getBody().halfWidth,
            0,
            player.getBody().halfHeight - player.getBody().halfWidth
        );

    // Resize the sprite to fit TILE_SIZE
    player.setDisplaySize(size, size);

    // Apply a circular mask
    player.maskShape = player.game.add.graphics();
    player.maskShape.fillStyle(0xffffff);
    player.maskShape.fillCircle(0, 0, radius);
    player.maskShape.setPosition(player.x, player.y);

    const mask = player.maskShape.createGeometryMask();
    player.setMask(mask);

    // Cleanup: Hide the mask shape
    player.maskShape.setVisible(false);
};

export const getPlayerVictims = (
    prevGameInfo: GameData,
    killer: PlayerType
) => {
    const victims = prevGameInfo.players.filter((player) =>
        killer.kills.includes(player.id)
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

type Procedure = (...args: any[]) => void;

export const debounce = (func: Procedure, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;

    return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

