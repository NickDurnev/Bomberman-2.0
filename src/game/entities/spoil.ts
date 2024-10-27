import { SPEED, POWER, DELAY, TILE_SIZE } from "../../utils/constants";

interface SpoilData {
    id: number;
    spoil_type: number;
    col: number;
    row: number;
}

export default class Spoil extends Phaser.GameObjects.Sprite {
    private id: number;

    constructor(scene: Phaser.Scene, spoil: SpoilData) {
        // Determine the spoil type frame based on the type constant
        const spoil_type =
            spoil.spoil_type === DELAY
                ? 0
                : spoil.spoil_type === POWER
                ? 1
                : spoil.spoil_type === SPEED
                ? 2
                : 0;

        // Initialize the sprite at the specified position with the chosen frame
        super(
            scene,
            spoil.col * TILE_SIZE,
            spoil.row * TILE_SIZE,
            "spoil_tileset",
            spoil_type
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

