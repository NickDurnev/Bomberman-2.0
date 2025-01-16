import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import { config } from "./main";
import { EventBus } from "./EventBus";
import clientSocket from "../utils/socket";

export interface IRefPhaserGame {
    game: Phaser.Game | null;
    scene: Phaser.Scene | null;
}

interface IProps {
    // currentActiveScene?: (scene_instance: Phaser.Scene) => void;
    gameId: string;
}

export function PhaserGame({ gameId }: Readonly<IProps>) {
    const game = useRef<Phaser.Game | null>(null);
    console.log("game:", game);

    useEffect(() => {
        // Destroy the existing game if any, then initialize a new one
        // if (game.current) {
        //     game.current.destroy(true); // Clean up the game
        //     game.current = null; // Reset reference
        // }

        launchGame();

        return () => {
            // Cleanup when component unmounts
            if (game.current) {
                console.log("CLEANUP ON UNMOUNT");
                game.current.destroy(true);
                game.current = null;
            }
        };
    }, []);

    // useEffect(() => {
    //     // Register listener for the current scene
    //     const onCurrentSceneReady = (scene_instance: Phaser.Scene) => {
    //         if (
    //             currentActiveScene &&
    //             typeof currentActiveScene === "function"
    //         ) {
    //             currentActiveScene(scene_instance);
    //         }
    //         if (typeof ref === "function") {
    //             ref({
    //                 game: game.current,
    //                 scene: scene_instance,
    //             });
    //         } else if (ref) {
    //             ref.current = {
    //                 game: game.current,
    //                 scene: scene_instance,
    //             };
    //         }
    //     };

    //     EventBus.on("current-scene-ready", onCurrentSceneReady);

    //     return () => {
    //         console.log("Removing EventBus listener");
    //         EventBus.off("current-scene-ready", onCurrentSceneReady);
    //     };
    // }, [currentActiveScene, ref]);

    const launchGame = () => {
        if (game.current) {
            return;
        }
        clientSocket.emit("get current game", gameId, (gameData: any) => {
            if (gameData) {
                const newGame = new Phaser.Game(config);

                game.current = newGame;

                newGame.scene.start("Playing", gameData); // Start the scene here
            } else {
                console.error("Failed to retrieve game data!");
            }
        });
        console.log("Game launched successfully");
    };

    return <div id="game-container"></div>;
}

