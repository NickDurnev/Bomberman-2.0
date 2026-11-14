import { useParams } from "react-router-dom";
import clsx from "clsx";
import { PhaserGame } from "@game/PhaserGame";
import { ModalProvider } from "@components/index";
import { useGameLayout } from "@hooks/use-game-layout";
import RestartGameModal from "./components/RestartGameModal";
import PlayerWinModal from "./components/PlayerWinModal";
import CountdownTimer from "./components/CountdownTimer";
import PlayerStats from "./components/PlayerStats";
import HomeButton from "./components/HomeButton";
import Thumbstick from "./components/Thumbstick";
import BombButton from "./components/BombButton";
import { usePlayerInfo } from "./hooks/usePlayerInfo";

function Game() {
    const { gameId } = useParams();
    const { info, lastInfo, hidden, isDead, backToMenu } = usePlayerInfo();
    const { isTouch, isCompact, isPortrait } = useGameLayout();

    const touchClass = isTouch ? "touch-none select-none" : "";

    const modals = (
        <>
            <ModalProvider isUnclosable={true}>
                <RestartGameModal />
            </ModalProvider>
            <ModalProvider>
                <PlayerWinModal />
            </ModalProvider>
        </>
    );

    const stats = (
        <PlayerStats
            info={info}
            lastInfo={lastInfo}
            hidden={hidden}
            isDead={isDead}
            compact={isCompact}
        />
    );

    const controlsRow = (
        <div className="flex h-[170px] w-full shrink-0 items-center justify-between px-7">
            <Thumbstick />
            <BombButton />
        </div>
    );

    if (isCompact && isPortrait) {
        return (
            <div
                id="app"
                className={clsx(
                    "flex h-[100dvh] flex-col overflow-hidden",
                    touchClass,
                )}
            >
                {modals}
                <div className="flex shrink-0 items-start justify-between gap-2 px-3 pt-3">
                    {stats}
                    <HomeButton onClick={backToMenu} />
                </div>
                <div className="flex shrink-0 justify-center py-2">
                    <CountdownTimer compact />
                </div>
                <div className="relative min-h-0 w-full flex-1 overflow-hidden">
                    {gameId && <PhaserGame gameId={gameId} />}
                </div>
                {isTouch && controlsRow}
            </div>
        );
    }

    if (isCompact) {
        return (
            <div
                id="app"
                className={clsx("flex h-[100dvh] overflow-hidden", touchClass)}
            >
                {modals}
                <div className="flex h-full w-[150px] shrink-0 flex-col items-center justify-between py-3">
                    <div className="flex w-full justify-center px-2 [&>ul]:flex-wrap [&>ul]:justify-center">
                        {stats}
                    </div>
                    {isTouch && <Thumbstick />}
                </div>
                <div className="relative h-full min-w-0 flex-1 overflow-hidden">
                    {gameId && <PhaserGame gameId={gameId} />}
                </div>
                <div className="flex h-full w-[150px] shrink-0 flex-col items-center justify-between py-3">
                    <div className="flex flex-col items-center gap-2">
                        <CountdownTimer compact />
                        <HomeButton onClick={backToMenu} />
                    </div>
                    {isTouch && <BombButton />}
                </div>
            </div>
        );
    }

    return (
        <div
            id="app"
            className={clsx(
                "flex h-[100dvh] flex-col items-center gap-2 overflow-hidden pt-3",
                touchClass,
            )}
        >
            {modals}
            <div className="grid w-full max-w-[1120px] grid-cols-[1fr_auto_1fr] items-center">
                <div className="justify-self-start">{stats}</div>
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
            {isTouch && controlsRow}
        </div>
    );
}

export default Game;
