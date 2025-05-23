import Phaser from "phaser";
import { TILE_SIZE, EXPLOSION_TIME } from "@utils/constants";

type ConstructorParams = {
    scene: Phaser.Scene;
    id: string;
    col: number;
    row: number;
    playerId: string;
};

export class Bomb extends Phaser.GameObjects.Sprite {
    readonly game: Phaser.Scene;
    private playerId: string;
    id: string;

    constructor({ scene, id, col, row, playerId }: ConstructorParams) {
        // Calculate the center of the cell
        const centerCol = col * TILE_SIZE + TILE_SIZE / 2;
        const centerRow = row * TILE_SIZE + TILE_SIZE / 2;

        super(scene, centerCol, centerRow, "bomb_tileset");

        this.game = scene;
        this.id = id;
        this.playerId = playerId;

        // Add the bomb sprite to the scene
        this.game.add.existing(this);

        // Enable physics
        this.game.physics.add.existing(this);
        this.setDepth(10);
        this.getBody().setSize(TILE_SIZE - 8, TILE_SIZE - 8);

        this.getBody().setImmovable(true);

        // Add tween for scale animation
        this.game.add.tween({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: EXPLOSION_TIME,
            ease: Phaser.Math.Easing.Linear,
            yoyo: false,
            repeat: 0,
        });

        // Add bomb animation
        this.anims.create({
            key: "bomb",
            frames: this.anims.generateFrameNumbers("bomb_tileset", {
                start: 0,
                end: 13,
            }),
            frameRate: 6,
            repeat: -1,
        });

        this.play("bomb");
    }

    protected getBody(): Phaser.Physics.Arcade.Body {
        return this.body as Phaser.Physics.Arcade.Body;
    }

    public getPlayerId(): string {
        return this.playerId;
    }
}

