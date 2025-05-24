import Phaser, { AUTO } from "phaser";

import GameOver from "./scenes/GameOver";
import Playing from "./scenes/Playing";
import Preload from "./scenes/Preload";

export const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1120,
    height: 735,
    parent: "game-container",
    backgroundColor: "#202121",
    scene: [Preload, Playing, GameOver],
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
        },
    },
};

