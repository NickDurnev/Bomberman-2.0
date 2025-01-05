import { AUTO } from "phaser";
import { GameOver } from "./scenes/GameOver";
import Playing from "./scenes/Playing";
import clientSocket from "../utils/socket";

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1120,
    height: 735,
    parent: "game-container",
    backgroundColor: "#202121",
    scene: [Playing, GameOver],
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
        },
    },
};

const StartGame = (gameId?: string) => {
    clientSocket.emit("get current game", gameId, (gameData: any) => {
        if (gameData) {
            const game = new Phaser.Game(config);

            game.scene.start("Playing", gameData); // Start the scene here
            return game;
        } else {
            console.error("Failed to retrieve game data!");
        }
    });
};

export default StartGame;

