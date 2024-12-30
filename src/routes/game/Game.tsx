import { useRef } from "react";
import { useParams } from "react-router-dom";
import { IRefPhaserGame, PhaserGame } from "@game/PhaserGame";
import { Socket } from "@components/index";
import PlayerInfo from "./components/PlayerInfo";
import CountdownTimer from "./components/CountdownTimer";

function Game() {
    const { gameId } = useParams();
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    return (
        <div id="app">
            <Socket>
                <div className="flex items-center justify-center py-10 relative">
                    <PlayerInfo />
                    <div className="p-2 absolute top-[34px] left-1/2 -translate-x-1/2">
                        <CountdownTimer />
                    </div>
                    <PhaserGame gameId={gameId} ref={phaserRef} />
                </div>
            </Socket>
        </div>
    );
}

export default Game;

