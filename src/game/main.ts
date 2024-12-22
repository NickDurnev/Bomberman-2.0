import { AUTO, Game } from "phaser";
import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
// import { Game as MainGame } from "./scenes/Game";
import Playing from "./scenes/Playing";
// import MainMenu from "./scenes/MainMenu";
// import SelectMap from "./scenes/SelectMap";
// import PendingGame from "./scenes/PendingGame";
import Preloader from "./scenes/Preloader";
import clientSocket from "../utils/socket";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1120,
    height: 735,
    parent: "game-container",
    backgroundColor: "#202121",
    scene: [
        // Boot,
        // Preloader,
        // MainMenu,
        // SelectMap,
        // PendingGame,
        Playing,
        // MainGame,
        GameOver,
    ],
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
        },
    },
};

const StartGame = (parent: string, gameId?: string) => {
    clientSocket.emit("get current game", gameId, (gameData: any) => {
        if (gameData) {
            const game = new Phaser.Game(config);

            console.log(gameData);
            game.scene.start("Playing", gameData); // Start the scene here
            return game;
        } else {
            console.error("Failed to retrieve game data!");
        }
    });
};

export default StartGame;

