import clsx from "clsx";
import { useParams } from "react-router";
import { ModalProvider } from "@/components/index";
import { PhaserGame } from "@/game/PhaserGame";
import { useGameLayout } from "@/hooks/use-game-layout";
import BombButton from "@/routes/game/components/BombButton";
import CountdownTimer from "@/routes/game/components/CountdownTimer";
import HomeButton from "@/routes/game/components/HomeButton";
import PlayerStats from "@/routes/game/components/PlayerStats";
import PlayerWinModal from "@/routes/game/components/PlayerWinModal";
import RestartGameModal from "@/routes/game/components/RestartGameModal";
import Thumbstick from "@/routes/game/components/Thumbstick";
import { useCountdown } from "@/routes/game/hooks/useCountdown";
import { usePlayerInfo } from "@/routes/game/hooks/usePlayerInfo";

function Game() {
  const { gameId } = useParams();
  const { info, lastInfo, hidden, isDead, backToMenu } = usePlayerInfo();
  const { isTouch, isCompact, isPortrait } = useGameLayout();
  const timeLeft = useCountdown();

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
        className={clsx("flex h-dvh flex-col overflow-hidden", touchClass)}
      >
        {modals}
        <div className="flex shrink-0 items-start justify-between gap-2 px-3 pt-3">
          <div className="h-9 min-w-0 overflow-hidden">{stats}</div>
          <HomeButton onClick={backToMenu} />
        </div>
        <div className="flex shrink-0 justify-center py-2">
          <CountdownTimer timeLeft={timeLeft} compact />
        </div>
        <div
          key="game-view"
          className="relative mx-auto max-h-[735px] min-h-0 w-full max-w-[1120px] flex-1 overflow-hidden"
        >
          {gameId && <PhaserGame gameId={gameId} />}
        </div>
        {isTouch && controlsRow}
      </div>
    );
  }

  if (isCompact) {
    return (
      <div id="app" className={clsx("flex h-dvh overflow-hidden", touchClass)}>
        {modals}
        <div className="flex h-full w-[150px] shrink-0 flex-col items-center justify-between py-3">
          <div className="flex h-[128px] w-full justify-center overflow-hidden px-2 [&>ul]:flex-wrap [&>ul]:content-start [&>ul]:justify-center">
            {stats}
          </div>
          {isTouch && <Thumbstick />}
        </div>
        <div
          key="game-view"
          className="relative h-full max-h-[735px] max-w-[1120px] min-w-0 flex-1 self-center overflow-hidden"
        >
          {gameId && <PhaserGame gameId={gameId} />}
        </div>
        <div className="flex h-full w-[150px] shrink-0 flex-col items-center justify-between py-3">
          <div className="flex flex-col items-center gap-2">
            <CountdownTimer timeLeft={timeLeft} compact />
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
        "flex h-dvh flex-col items-center gap-2 overflow-hidden pt-3",
        touchClass,
      )}
    >
      {modals}
      <div className="grid w-full max-w-[1120px] grid-cols-[1fr_auto_1fr] items-center">
        <div className="justify-self-start">{stats}</div>
        <div className="justify-self-center">
          <CountdownTimer timeLeft={timeLeft} />
        </div>
        <div className="justify-self-end">
          <HomeButton onClick={backToMenu} />
        </div>
      </div>
      <div
        key="game-view"
        className="relative max-h-[735px] min-h-0 w-full max-w-[1120px] flex-1 overflow-hidden"
      >
        {gameId && <PhaserGame gameId={gameId} />}
      </div>
      {isTouch && controlsRow}
    </div>
  );
}

export default Game;
