import { Physics } from "phaser";
import { TILE_SIZE } from "@utils/constants";
import { ICell } from "@utils/types";

export class FireBlast extends Phaser.GameObjects.Sprite {
    private game: Phaser.Scene;
    private playerId: string;

    constructor(scene: Phaser.Scene, cell: ICell, playerId: string) {
        // Calculate the center of the cell
        const centerCol = cell.col * TILE_SIZE + TILE_SIZE / 2;
        const centerRow = cell.row * TILE_SIZE + TILE_SIZE / 2;

        super(scene, centerCol, centerRow, cell.type);

        this.game = scene;
        this.playerId = playerId;

        // Add the bomb sprite to the scene
        this.game.add.existing(this);

        // Enable physics
        this.game.physics.add.existing(this);
        this.setDepth(10);
        this.getBody().setSize(TILE_SIZE - 8, TILE_SIZE - 8);

        // const body = this.body as Phaser.Physics.Arcade.Body;
        this.getBody().setImmovable(true);

        // Add the blast animation
        this.anims.create({
            key: "blast",
            frames: this.anims.generateFrameNumbers(cell.type, {
                start: 0,
                end: 4,
            }),
            frameRate: 20,
            repeat: 0, // No looping
            hideOnComplete: true,
        });

        // Play the blast animation
        this.play("blast");

        // Listen for the animation complete event
        this.on("animationcomplete", this.onAnimationComplete, this);
    }

    protected getBody(): Physics.Arcade.Body {
        return this.body as Physics.Arcade.Body;
    }

    public getPlayerId(): string {
        return this.playerId;
    }

    private onAnimationComplete(): void {
        // Remove the physics body
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.destroy();

        // Remove the sprite from the scene
        this.destroy();
    }
}

