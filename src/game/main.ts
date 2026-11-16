import Phaser, { AUTO } from "phaser";

import GameOver from "@/game/scenes/GameOver";
import Playing from "@/game/scenes/Playing";
import Preload from "@/game/scenes/Preload";

export const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
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
