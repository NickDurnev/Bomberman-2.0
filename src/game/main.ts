import Phaser, { AUTO } from "phaser";

import GameOver from "./scenes/GameOver";
import Playing from "./scenes/Playing";
import Preload from "./scenes/Preload";

export const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    parent: "game-container",
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: "game-container",
        width: "100%",
        height: "100%",
    },
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

