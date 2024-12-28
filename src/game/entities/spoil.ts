import { Physics } from "phaser";
import { SPEED, POWER, DELAY, BOMBS, TILE_SIZE } from "../../utils/constants";
import { ISpoil } from "../../utils/types";

export default class Spoil extends Phaser.GameObjects.Sprite {
    private game: Phaser.Scene;
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
        this.game = scene;
        this.game.add.existing(this);

        // Enable physics
        this.game.physics.add.existing(this);
        this.getBody().setSize(TILE_SIZE - 4, TILE_SIZE - 4);

        this.getBody().setImmovable(true);
    }

    protected getBody(): Physics.Arcade.Body {
        return this.body as Physics.Arcade.Body;
    }
}

