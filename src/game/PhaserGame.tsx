import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
    const navigate = useNavigate();
    const game = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        launchGame();
    }, [gameId]);

    // const reloadPage = () => {
    //     navigate(0);
    // };

    const launchGame = () => {
        if (game.current) {
            console.log("Destroying previous game instance...");
            game.current?.destroy(true);
            // reloadPage();
        }
        clientSocket.emit("get current game", gameId, (gameData: any) => {
            console.log(" gameData:", gameData);
            if (gameData) {
                console.log("Launching new game...");
                game.current = new Phaser.Game(config);
                game.current.scene.start("Preload", gameData);
            } else {
                console.error("Failed to retrieve game data!");
            }
        });
    };

    return <div id="game-container"></div>;
}

