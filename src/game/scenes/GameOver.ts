import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import clientSocket from "@utils/socket";

class GameOver extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameOverText: Phaser.GameObjects.Text;

    constructor() {
        super("GameOver");
    }

    create() {
        this.setEventHandlers();
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0xff0000);

        this.background = this.add.image(512, 384, "background");
        this.background.setAlpha(0.5);

        this.gameOverText = this.add
            .text(512, 384, "Game Over", {
                fontFamily: "Arial Black",
                fontSize: 64,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5)
            .setDepth(100);

        EventBus.emit("current-scene-ready", this);
    }

    private setEventHandlers() {
        clientSocket.on("launch game", this.launchGame.bind(this));
    }

    launchGame(game: any): void {
        this.scene.start("Playing", game);
    }

    changeScene() {
        this.scene.start("MainMenu");
    }
}

export default GameOver;

