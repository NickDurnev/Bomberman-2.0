import { useRef } from "react";
import { useParams } from "react-router-dom";
import { IRefPhaserGame, PhaserGame } from "@game/PhaserGame";
import { Socket } from "@components/index";

function Game() {
    const { gameId } = useParams();
    console.log("gameId:", gameId);
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

