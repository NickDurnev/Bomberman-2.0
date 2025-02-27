import { useEffect, useRef } from "react";
import { config } from "./main";
import clientSocket from "../utils/socket";

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
        launchGame();
    }, [gameId]);

    const launchGame = () => {
        if (game.current) {
            game.current?.destroy(true);
        }
        clientSocket.emit("get current game", gameId, (gameData: any) => {
            if (gameData) {
                game.current = new Phaser.Game(config);
                game.current.scene.start("Preload", gameData);
            }
        });
    };

    return <div id="game-container"></div>;
}

