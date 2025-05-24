import clientSocket from "@utils/socket";
import Phaser, { Scene } from "phaser";

import { GameData } from "@utils/types";
import { EventBus } from "../EventBus";
import Playing from "./Playing";

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
        this.camera.setBackgroundColor(0x252525);

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

    launchGame(game: GameData): void {
        this.scene.remove("Playing");
        this.scene.add("Playing", Playing, true, game);
    }

    changeScene() {
        this.scene.start("MainMenu");
    }
}

export default GameOver;

