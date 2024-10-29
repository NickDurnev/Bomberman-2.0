import Phaser from "phaser";
import { TILE_SIZE, PING } from "../../utils/constants";
import { Text } from "../../helpers/elements";
import { Spawn, PlayerConfig } from "../../utils/types";

export default class EnemyPlayer extends Phaser.GameObjects.Sprite {
    private game: Phaser.Scene;
    private id: number;
    private currentPosition: Spawn;
    lastMoveAt: number;

    constructor({ scene, id, spawn, skin }: PlayerConfig) {
        super(scene, spawn.x, spawn.y, "bomberman_" + skin);

        this.game = scene;
        this.id = id;
        this.currentPosition = spawn;
        this.lastMoveAt = 0;

        // Enable physics on this object
        this.scene.physics.add.existing(this);
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (body) {
            body.setSize(20, 20).setOffset(6, 6);
            body.immovable = true;
        }

        // Creating animations with generateFrameNumbers for each animation direction
        this.anims.create({
            key: "up",
            frames: this.anims.generateFrameNumbers("bomberman_" + skin, {
                frames: [9, 10, 11],
            }),
            frameRate: 15,
            repeat: -1,
        });

        this.anims.create({
            key: "down",
            frames: this.anims.generateFrameNumbers("bomberman_" + skin, {
                frames: [0, 1, 2],
            }),
            frameRate: 15,
            repeat: -1,
        });

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("bomberman_" + skin, {
                frames: [6, 7, 8],
            }),
            frameRate: 15,
            repeat: -1,
        });

        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("bomberman_" + skin, {
                frames: [3, 4, 5],
            }),
            frameRate: 15,
            repeat: -1,
        });

        this.defineSelf(skin);
    }

    update() {
        // this.game.debug.body(this);
    }

    goTo(newPosition: Spawn) {
        this.lastMoveAt = this.game.time.now;
        this.animateFace(newPosition);

        this.scene.add.tween({
            targets: this,
            x: newPosition.x,
            y: newPosition.y,
            duration: PING,
            ease: Phaser.Math.Easing.Linear,
        });
    }

    private animateFace(newPosition: Spawn) {
        let face = "down";
        const diffX = newPosition.x - this.currentPosition.x;
        const diffY = newPosition.y - this.currentPosition.y;

        if (diffX < 0) {
            face = "left";
        } else if (diffX > 0) {
            face = "right";
        } else if (diffY < 0) {
            face = "up";
        } else if (diffY > 0) {
            face = "down";
        }

        this.anims.play(face);
        this.currentPosition = newPosition;
    }

    private defineSelf(name: string) {
        // Define text styling with a type assertion if necessary
        const style = {
            font: "14px Arial",
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeThickness: 3,
        } as Phaser.Types.GameObjects.Text.TextStyle;

        // Construct playerText using type assertion to allow 'game'
        const playerText = new Text({
            scene: this.game, // Type assertion to avoid TypeScript error
            x: this.x + TILE_SIZE / 2,
            y: this.y - 10,
            text: name,
            style: style,
        } as any);

        // Add the text to the scene
        this.scene.add.existing(playerText);
    }
}

