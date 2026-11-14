import Phaser from "phaser";
import { useEffect, useRef } from "react";

import clientSocket from "@utils/socket";
import { GameData } from "@utils/types";
import { config } from "./main";

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
            game.current?.destroy(true);
            game.current = new Phaser.Game(config);
            game.current.scene.start("Preload", gameData);
        });

        return () => {
            cancelled = true;
            game.current?.destroy(true);
            game.current = null;
        };
    }, [gameId]);

    return <div id="game-container" className="absolute inset-0"></div>;
}

