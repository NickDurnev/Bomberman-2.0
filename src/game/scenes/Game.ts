import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    field: Phaser.GameObjects.Grid;

    constructor() {
        super("Game");
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.field = this.add.grid(
            512,
            384,
            1024,
            768,
            32,
            32,
            0xf9faf9,
            0.5,
            0x000000,
            0.5
        );

        // this.background = this.add.image(512, 384, 'background');
        // this.background.setAlpha(0.5);

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        this.scene.start("GameOver");
    }
}

