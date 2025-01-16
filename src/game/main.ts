import { AUTO } from "phaser";
import { GameOver } from "./scenes/GameOver";
import Playing from "./scenes/Playing";

export const config: Phaser.Types.Core.GameConfig = {
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

// const StartGame = (gameId: string) => {
//     let game = null;
//     clientSocket.emit("get current game", gameId, (gameData: any) => {
//         if (gameData) {
//             game = new Phaser.Game(config);

//             game.scene.start("Playing", gameData); // Start the scene here
//         } else {
//             console.error("Failed to retrieve game data!");
//         }
//     });
//     console.log("game:", game);
//     return game;
// };

// export default StartGame;

