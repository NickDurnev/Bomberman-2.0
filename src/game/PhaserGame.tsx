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
    }, []);

    const launchGame = () => {
        if (game.current) {
            return;
        }
        clientSocket.emit("get current game", gameId, (gameData: any) => {
            if (gameData) {
                const newGame = new Phaser.Game(config);

                newGame.scene.start("Preload", gameData); // Start the scene here
            } else {
                console.error("Failed to retrieve game data!");
            }
        });
        console.log("Game launched successfully");
    };

    return <div id="game-container"></div>;
}

