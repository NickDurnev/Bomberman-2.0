import { GRID_WIDTH, GRID_HEIGHT, TILE_SIZE } from "./constants";

export class RenderLevel {
    // private scene: Phaser.Scene;

    constructor(private readonly scene: Phaser.Scene) {
        // Now using the passed scene directly
    }

    createExternalWalls() {
        const cols = Math.floor(GRID_WIDTH / TILE_SIZE);
        const rows = Math.floor(GRID_HEIGHT / TILE_SIZE);

        // Create top and bottom walls
        for (let i = 0; i < cols; i++) {
            // Top row
            this.scene.add
                .image(i * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 2, "wall")
                .setDisplaySize(TILE_SIZE, TILE_SIZE);

            // Bottom row
            this.scene.add
                .image(
                    i * TILE_SIZE + TILE_SIZE / 2,
                    GRID_HEIGHT - TILE_SIZE / 2,
                    "wall"
                )
                .setDisplaySize(TILE_SIZE, TILE_SIZE);
        }

        // Create left and right walls
        for (let i = 0; i < rows; i++) {
            // Left column
            this.scene.add
                .image(TILE_SIZE / 2, i * TILE_SIZE + TILE_SIZE / 2, "wall")
                .setDisplaySize(TILE_SIZE, TILE_SIZE);

            // Right column
            this.scene.add
                .image(
                    GRID_WIDTH - TILE_SIZE / 2,
                    i * TILE_SIZE + TILE_SIZE / 2,
                    "wall"
                )
                .setDisplaySize(TILE_SIZE, TILE_SIZE);
        }
    }

    createInternalWalls(MAP: number[][]) {
        for (let i = 1; i < MAP.length - 1; i++) {
            for (let j = 1; j < MAP[i].length - 1; j++) {
                if (MAP[i][j] === 1) {
                    this.scene.add
                        .image(
                            i * TILE_SIZE + TILE_SIZE / 2,
                            j * TILE_SIZE + TILE_SIZE / 2,
                            "wall"
                        )
                        .setDisplaySize(TILE_SIZE, TILE_SIZE);
                }
                if (MAP[i][j] === 2) {
                    this.scene.add
                        .image(
                            i * TILE_SIZE + TILE_SIZE / 2,
                            j * TILE_SIZE + TILE_SIZE / 2,
                            "bomb"
                        )
                        .setDisplaySize(TILE_SIZE, TILE_SIZE - 2);
                }
            }
        }
    }
}

