import { SPEED, POWER, DELAY, BOMBS, TILE_SIZE } from "../../utils/constants";
import { ISpoil } from "../../utils/types";

export default class Spoil extends Phaser.GameObjects.Sprite {
    id: number;

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

        // Initialize the sprite at the specified position with the chosen frame
        super(
            scene,
            spoil.col * TILE_SIZE,
            spoil.row * TILE_SIZE,
            "spoil_tileset",
            spoil_tile
        );

        this.id = spoil.id;
        scene.add.existing(this);

        // Enable physics on the sprite
        scene.physics.add.existing(this);
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setImmovable(true);
        }
    }
}

