import { useParams } from "react-router-dom";
import { PhaserGame } from "@game/PhaserGame";
import { Socket, ModalProvider } from "@components/index";
import PlayerInfo from "./components/PlayerInfo";
import RestartGameModal from "./components/RestartGameModal";
import CountdownTimer from "./components/CountdownTimer";

function Game() {
    const { gameId } = useParams();

    return (
        <div id="app">
            <ModalProvider>
                <Socket>
                    <div className="flex items-center justify-center py-10 relative">
                        <RestartGameModal />
                        <PlayerInfo />
                        <div className="p-2 absolute top-[34px] left-1/2 -translate-x-1/2">
                            <CountdownTimer />
                        </div>
                        {gameId && <PhaserGame gameId={gameId} />}
                    </div>
                </Socket>
            </ModalProvider>
        </div>
    );
}

export default Game;

