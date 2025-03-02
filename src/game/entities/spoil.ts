import { Physics } from "phaser";
import { SPEED, POWER, BOMBS, TILE_SIZE } from "../../utils/constants";
import { ISpoil } from "../../utils/types";

export class Spoil extends Phaser.GameObjects.Sprite {
    readonly game: Phaser.Scene;
    id: string;

    constructor(scene: Phaser.Scene, spoil: ISpoil) {
        // Determine the spoil type frame based on the type constant
        let spoil_tile = 0;

        switch (spoil.spoil_type) {
            case BOMBS:
                spoil_tile = 0;
                break;
            case POWER:
                spoil_tile = 1;
                break;
            case SPEED:
                spoil_tile = 2;
                break;
        }

        // Calculate the center of the cell
        const centerCol = spoil.col * TILE_SIZE + TILE_SIZE / 2;
        const centerRow = spoil.row * TILE_SIZE + TILE_SIZE / 2;

        // Initialize the sprite at the specified position with the chosen frame
        super(scene, centerCol, centerRow, "spoil_tileset", spoil_tile);

        this.id = spoil.id;
        this.game = scene;
        this.game.add.existing(this);

        // Enable physics
        this.game.physics.add.existing(this);
        this.getBody().setSize(TILE_SIZE, TILE_SIZE);

        this.getBody().setImmovable(true);
    }

    protected getBody(): Physics.Arcade.Body {
        return this.body as Physics.Arcade.Body;
    }
}

