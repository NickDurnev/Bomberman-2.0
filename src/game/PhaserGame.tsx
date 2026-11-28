import Phaser from "phaser";
import { useEffect, useRef } from "react";
import { config } from "@/game/main";
import { PROTOCOL_VERSION } from "@/utils/constants";
import { setCurrentGame } from "@/utils/e2e";
import clientSocket, { markServerProtocol } from "@/utils/socket";
import { setActiveTexturePack } from "@/utils/texturePacks";
import { GameData } from "@/utils/types";

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface IProps {
  gameId: string;
}

export function PhaserGame({ gameId }: Readonly<IProps>) {
  const game = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    // The game is created in an async ack. If the effect is cleaned up
    // before the ack arrives (StrictMode re-run, fast navigation), the
    // cleanup has nothing to destroy yet, so the ack must not create one.
    let cancelled = false;

    clientSocket.emit("get current game", gameId, (gameData: GameData) => {
      if (cancelled || !gameData) {
        return;
      }
      markServerProtocol(gameData.protocol);
      if (gameData.protocol !== PROTOCOL_VERSION) {
        return;
      }
      // The room's pack for the React HUD (Preload reads it from gameData)
      setActiveTexturePack(gameData.texturePack);
      game.current?.destroy(true);
      game.current = new Phaser.Game(config);
      setCurrentGame(game.current);
      game.current.scene.start("Preload", gameData);
    });

    return () => {
      cancelled = true;
      game.current?.destroy(true);
      game.current = null;
      setCurrentGame(null);
    };
  }, [gameId]);

  return <div id="game-container" className="absolute inset-0"></div>;
}
