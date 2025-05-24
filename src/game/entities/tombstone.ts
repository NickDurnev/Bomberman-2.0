import Phaser from "phaser";

import { TILE_SIZE } from "@utils/constants";
import { ITombStone } from "@utils/types";

export class Tombstone extends Phaser.GameObjects.Sprite {
    readonly game: Phaser.Scene;
    readonly playerId: string;
    id: string;

    constructor(game: Phaser.Scene, tombstone: ITombStone) {
        // Calculate the center of the cell
        const centerCol = tombstone.col * TILE_SIZE + TILE_SIZE / 2;
        const centerRow = tombstone.row * TILE_SIZE + TILE_SIZE / 2;

        super(game, centerCol, centerRow, "tombstone");

        this.game = game;
        this.id = tombstone.tombId;
        this.playerId = tombstone.player_id;
        this.game.add.existing(this);
        this.setDepth(1);
    }
}

