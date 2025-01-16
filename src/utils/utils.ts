import { Spawn } from "@utils/types";
import { TILE_SIZE } from "./constants";
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
    console.log("entities.getChildren():", entities?.getChildren());
    entities.getChildren().forEach((entity) => {
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
    id: number,
    entities: Phaser.GameObjects.Group
): GameObject | null {
    if (!entities) {
        return null;
    }
    console.log("entities.getChildren():", entities?.getChildren());
    let result = null;
    entities.getChildren().forEach((entity) => {
        const gameObject = entity as GameObject;
        if (gameObject.id === id) {
            result = gameObject;
        }
    });
    return result;
};

export const findAndDestroyById = function (
    id: number,
    entities: Phaser.GameObjects.Group
): void {
    const entity = findById(id, entities);
    if (!entity) {
        return;
    }

    entity.destroy();
};

export const getRandomColor = (colors: string[]) => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};

