import { TILE_SIZE } from "../../utils/constants";

interface Cell {
    col: number;
    row: number;
    type: string;
}

export default class FireBlast extends Phaser.GameObjects.Sprite {
    private game: Phaser.Scene;

    constructor(game: Phaser.Scene, cell: Cell) {
        super(game, cell.col * TILE_SIZE, cell.row * TILE_SIZE, cell.type);

        this.game = game;

        // Add the blast animation
        this.anims.create({
            key: "blast",
            frames: this.anims.generateFrameNumbers(cell.type, {
                start: 0,
                end: 4,
            }),
            frameRate: 15,
            repeat: 0, // No looping
            hideOnComplete: true,
        });

        // Play the blast animation
        this.play("blast");

        // Enable physics
        this.scene.physics.add.existing(this);
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setImmovable(true);
        }
    }
}

