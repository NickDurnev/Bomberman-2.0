import Phaser from "phaser";
import { TILE_SIZE } from "../../utils/constants";

export default class Tombstone extends Phaser.GameObjects.Sprite {
    readonly game: Phaser.Scene;
    id: string;

    constructor(game: Phaser.Scene, tombId: string, col: number, row: number) {
        // Calculate the center of the cell
        const centerCol = col * TILE_SIZE + TILE_SIZE / 2;
        const centerRow = row * TILE_SIZE + TILE_SIZE / 2;

        super(game, centerCol, centerRow, "tombstone");

        this.game = game;
        this.id = tombId;
        this.game.add.existing(this);
        this.setDepth(1);
    }
}

