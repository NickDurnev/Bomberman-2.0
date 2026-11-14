import { useParams } from "react-router-dom";
import { PhaserGame } from "@game/PhaserGame";
import { ModalProvider } from "@components/index";
import { useGameLayout } from "@hooks/use-game-layout";
import RestartGameModal from "./components/RestartGameModal";
import PlayerWinModal from "./components/PlayerWinModal";
import CountdownTimer from "./components/CountdownTimer";
import PlayerStats from "./components/PlayerStats";
import HomeButton from "./components/HomeButton";
import { usePlayerInfo } from "./hooks/usePlayerInfo";

function Game() {
    const { gameId } = useParams();
    const { info, lastInfo, hidden, isDead, backToMenu } = usePlayerInfo();
    // Task 4 adds the compact phone layouts. Until then compact uses the desktop tree.
    useGameLayout();

    return (
        <div
            id="app"
            className="flex h-[100dvh] flex-col items-center gap-2 overflow-hidden pt-3"
        >
            <ModalProvider isUnclosable={true}>
                <RestartGameModal />
            </ModalProvider>
            <ModalProvider>
                <PlayerWinModal />
            </ModalProvider>
            <div className="grid w-full max-w-[1120px] grid-cols-3 items-center">
                <div className="justify-self-start">
                    <PlayerStats
                        info={info}
                        lastInfo={lastInfo}
                        hidden={hidden}
                        isDead={isDead}
                    />
                </div>
                <div className="justify-self-center">
                    <CountdownTimer />
                </div>
                <div className="justify-self-end">
                    <HomeButton onClick={backToMenu} />
                </div>
            </div>
            <div className="relative max-h-[735px] min-h-0 w-full max-w-[1120px] flex-1 overflow-hidden">
                {gameId && <PhaserGame gameId={gameId} />}
            </div>
        </div>
    );
}

export default Game;
