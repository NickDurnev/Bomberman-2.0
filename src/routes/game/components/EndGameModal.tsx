import { useCallback, useEffect, useRef, useState } from "react";
import { Emoji } from "react-apple-emojis";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useNavigate, useParams } from "react-router";
import {
  AnimatedTooltip,
  Button,
  ColourfulText,
  fallbackAvatar,
  Modal,
  ModalBody,
  ModalContent,
  PlayersSlots,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useModal,
} from "@/components/index";
import { EventBus } from "@/game/EventBus";
import clientSocket from "@/utils/socket";
import {
  EndGame,
  EndReason,
  GameData as Game,
  Player,
  PlayerWin,
} from "@/utils/types";
import { getPlayerVictims } from "@/utils/utils";

type GameData = {
  current_game: Game;
};

// If "end game" arrives and the Playing scene does not emit "show-results"
// (no running scene), the results open after this delay anyway.
const RESULTS_FALLBACK_MS = 1500;

// The winner shown for a win or a disconnect when "player win" did not
// arrive: the only player still alive.
const getSoleSurvivor = (gameInfo: Game | null): Player | null => {
  const alive = gameInfo?.players.filter(player => player.isAlive) ?? [];
  return alive.length === 1 ? alive[0] : null;
};

// One results modal for every match ending. The match is over when it opens;
// "end game" brings the next pending game, which this client enters at once,
// so the restart runs in the page (no reload).
const EndGameModal = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { setOpen } = useModal();

  const [winner, setWinner] = useState<Player | null>(null);
  const [prevGameInfo, setPrevGameInfo] = useState<Game | null>(null);
  const [reason, setReason] = useState<EndReason | null>(null);
  const [newGameId, setNewGameId] = useState<string | null>(null);
  const [gameInfo, setGameInfo] = useState<Game | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Socket and EventBus handlers read these, never the state above.
  const newGameIdRef = useRef<string | null>(null);
  const isOpenRef = useRef(false);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routeGameIdRef = useRef(gameId);

  const clearFallbackTimer = useCallback(() => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  const openResults = useCallback(() => {
    clearFallbackTimer();
    isOpenRef.current = true;
    setOpen(true);
  }, [clearFallbackTimer, setOpen]);

  // Navigates once to the next match. The countdown end and "launch game"
  // both call it; the second call does nothing.
  const launchNewGame = useCallback(() => {
    const id = newGameIdRef.current;
    if (!id) {
      return;
    }
    newGameIdRef.current = null;
    navigate(`/game/${id}`);
    setOpen(false);
  }, [navigate, setOpen]);

  // The Game route does not remount when :gameId changes, so reset everything
  // for the new match.
  useEffect(() => {
    if (routeGameIdRef.current === gameId) {
      return;
    }
    routeGameIdRef.current = gameId;

    clearFallbackTimer();
    newGameIdRef.current = null;
    isOpenRef.current = false;
    setWinner(null);
    setPrevGameInfo(null);
    setReason(null);
    setNewGameId(null);
    setGameInfo(null);
    setIsTimerRunning(false);
    setOpen(false);
  }, [gameId, clearFallbackTimer, setOpen]);

  useEffect(() => {
    const onPlayerWin = ({ winner, prevGameInfo }: PlayerWin) => {
      // Only the players in prevGameInfo carry the noKillPhrase.
      const winnerInfo = prevGameInfo.players.find(
        player => player.id === winner.id,
      );
      setWinner(winnerInfo ?? winner);
      setPrevGameInfo(prevGameInfo);
      setReason("win");
    };

    const onEndGame = ({ new_game_id, prevGameInfo, reason }: EndGame) => {
      setPrevGameInfo(prevGameInfo);
      setReason(reason);
      setNewGameId(new_game_id);

      if (newGameIdRef.current !== new_game_id) {
        newGameIdRef.current = new_game_id;
        clientSocket.emit("enter pending game", new_game_id);
      }

      if (!isOpenRef.current && !fallbackTimerRef.current) {
        fallbackTimerRef.current = setTimeout(openResults, RESULTS_FALLBACK_MS);
      }
    };

    const onUpdateGame = (data: GameData) => {
      setGameInfo(data.current_game);
    };

    const onStartTimer = () => {
      setIsTimerRunning(true);
    };

    clientSocket.on("player win", onPlayerWin);
    clientSocket.on("end game", onEndGame);
    clientSocket.on("update game", onUpdateGame);
    clientSocket.on("launch game", launchNewGame);
    clientSocket.on("start timer", onStartTimer);
    EventBus.on("show-results", openResults);

    return () => {
      clientSocket.off("player win", onPlayerWin);
      clientSocket.off("end game", onEndGame);
      clientSocket.off("update game", onUpdateGame);
      clientSocket.off("launch game", launchNewGame);
      clientSocket.off("start timer", onStartTimer);
      EventBus.off("show-results", openResults);
      clearFallbackTimer();
    };
  }, [launchNewGame, openResults, clearFallbackTimer]);

  // launch game can clear the id before the countdown ends: never start a
  // match without an id (the server would clear this player's game id).
  const startTimer = () => {
    const id = newGameIdRef.current;
    if (!id) {
      return;
    }
    clientSocket.emit("start timer", id);
  };

  const startGame = () => {
    const id = newGameIdRef.current;
    if (!id) {
      return;
    }
    clientSocket.emit("start game", id);
    launchNewGame();
  };

  const leaveGameAction = () => {
    clientSocket.emit("leave pending game");
    navigate("/");
  };

  const shownWinner =
    reason === "win" || reason === "disconnect"
      ? (winner ?? getSoleSurvivor(prevGameInfo))
      : null;
  // A disconnect that leaves nobody alive has no winner: show it as a draw.
  const isDraw = reason === "draw" || (reason === "disconnect" && !shownWinner);
  const victims =
    shownWinner && prevGameInfo
      ? getPlayerVictims(prevGameInfo, shownWinner)
      : [];
  const players = gameInfo ? Object.values(gameInfo.players) : [];
  const canStartGame = players.length > 1;

  return (
    <div className="absolute">
      <Modal>
        <ModalBody className="[@media(max-height:500px)]:max-h-[95dvh]! [@media(max-height:500px)]:min-h-0! [@media(max-height:500px)]:max-w-[80%]!">
          <ModalContent className="min-h-0 overflow-y-auto *:shrink-0 [@media(max-height:500px)]:p-4!">
            {shownWinner && (
              <div className="mx-auto mt-6 flex flex-col items-center justify-center gap-y-8 [@media(max-height:500px)]:mt-0 [@media(max-height:500px)]:gap-y-3">
                <img
                  src={shownWinner.skin || fallbackAvatar(shownWinner.name)}
                  onError={e => {
                    const fallback = fallbackAvatar(shownWinner.name);
                    if (!e.currentTarget.src.endsWith(fallback)) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                  alt={shownWinner.name}
                  className="motion-preset-confetti motion-loop-once h-32 w-32 rounded-full [@media(max-height:500px)]:h-16 [@media(max-height:500px)]:w-16"
                />
                <div className="flex flex-col items-center gap-y-2">
                  <h3 className="motion-preset-expand motion-loop-once text-center text-3xl font-bold tracking-wider">
                    Winner{" "}
                    <ColourfulText
                      text={shownWinner.name}
                      colors={["#8852AC"]}
                    />
                  </h3>
                  {reason === "disconnect" && (
                    <p className="text-center text-xl font-semibold">
                      by forfeit
                    </p>
                  )}
                </div>
                {victims.length !== 0 && (
                  <h4 className="text-center text-2xl font-bold tracking-wider">
                    Eliminated:
                  </h4>
                )}
                <div className="mb-10 flex w-full flex-row items-center justify-center [@media(max-height:500px)]:mb-2">
                  {victims.length !== 0 && (
                    <AnimatedTooltip items={victims} size={"medium"} />
                  )}
                  {victims.length === 0 && (
                    <p className="text-center text-xl font-semibold">
                      {shownWinner.noKillPhrase}
                    </p>
                  )}
                </div>
              </div>
            )}
            {isDraw && (
              <h3 className="motion-preset-expand motion-loop-once mt-6 mb-8 text-center text-3xl font-bold tracking-wider [@media(max-height:500px)]:mt-0 [@media(max-height:500px)]:mb-3">
                Draw
              </h3>
            )}
            {reason === "timeout" && (
              <h3 className="motion-preset-expand motion-loop-once mt-6 mb-8 text-center text-3xl font-bold tracking-wider [@media(max-height:500px)]:mt-0 [@media(max-height:500px)]:mb-3">
                Time's up
              </h3>
            )}
            <h3 className="motion-preset-expand motion-loop-once text-center text-3xl font-bold tracking-wider">
              Stats
            </h3>
            <div className="mb-5 max-h-[325px] overflow-x-hidden overflow-y-auto pt-5 [@media(max-height:500px)]:mb-2 [@media(max-height:500px)]:max-h-[120px] [@media(max-height:500px)]:pt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">No.</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Eliminated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prevGameInfo?.players.map((player, index) => {
                    const playerVictims = getPlayerVictims(
                      prevGameInfo,
                      player,
                    );
                    return (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell>{player.name}</TableCell>
                        <TableCell>
                          {playerVictims.length !== 0 && (
                            <div className="flex flex-row items-center justify-start">
                              <AnimatedTooltip
                                items={playerVictims}
                                size={"small"}
                              />
                            </div>
                          )}
                          {playerVictims.length === 0 && player.noKillPhrase}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {newGameId && gameInfo && (
              <PlayersSlots
                max_players={gameInfo.max_players}
                players={players}
                size={"small"}
              />
            )}
            {newGameId &&
              (isTimerRunning ? (
                <div className="flex flex-col gap-y-8">
                  <h3 className="motion-preset-expand motion-loop-once text-center text-3xl font-bold tracking-wider">
                    Game will start in
                  </h3>
                  <div className="flex justify-center">
                    <CountdownCircleTimer
                      isPlaying
                      duration={3}
                      colors="#8953AD"
                      strokeWidth={10}
                      onComplete={() => {
                        setIsTimerRunning(false);
                        startGame();
                      }}
                    >
                      {({ remainingTime }) => (
                        <div className="text-4xl font-bold">
                          {remainingTime}
                        </div>
                      )}
                    </CountdownCircleTimer>
                  </div>
                </div>
              ) : (
                <div className="mx-auto flex flex-col items-center justify-center gap-y-8 [@media(max-height:500px)]:gap-y-3">
                  <Button
                    text="Restart Game"
                    animated
                    animatedIcon={<Emoji name="bomb" width={20} />}
                    onClick={startTimer}
                    disabled={!canStartGame}
                  />
                  <Button
                    text="Main Menu"
                    animated
                    animatedIcon={<Emoji name="door" width={20} />}
                    onClick={leaveGameAction}
                  />
                </div>
              ))}
          </ModalContent>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default EndGameModal;
