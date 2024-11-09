import { useRef } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { Socket } from "./components";

function Game() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    return (
        <div id="app">
            <Socket>
                <PhaserGame ref={phaserRef} />
            </Socket>
        </div>
    );
}

export default Game;

