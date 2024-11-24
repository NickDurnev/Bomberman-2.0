import { Spawn } from "../utils/types";

interface GameObjectWithId extends Phaser.GameObjects.GameObject {
    id: number;
    goTo(newPosition: Spawn): void;
}

// Update your findFrom function to use the custom type
export const findFrom = function (
    id: number,
    entities: Phaser.GameObjects.Group
): GameObjectWithId | null {
    for (const entity of entities.getChildren()) {
        // Use type assertion to let TypeScript know this object has an id property
        const gameObject = entity as GameObjectWithId;
        if (gameObject.id !== id) {
            continue;
        }
        return gameObject;
    }
    return null;
};

export const findAndDestroyFrom = function (
    id: number,
    entities: Phaser.GameObjects.Group
): void {
    const entity = findFrom(id, entities);
    if (!entity) {
        return;
    }

    entity.destroy();
};

export const getRandomColor = (colors: string[]) => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};

