import Phaser from "phaser";
import Playing from "@/game/scenes/Playing";

export interface IUser {
  email: string;
  locale: string;
  name: string;
  picture: string;
  socketID: string;
  _id?: string;
}

export type ISpoilType = 0 | 1 | 2 | 3;

type PlayerId = string;
type GameId = string;

export type Coordinates = { x: number; y: number };

export interface PlayerPositionData extends Coordinates {
  player_id: PlayerId;
}

export interface TeleportData extends PlayerPositionData {
  /** Server tick when the transit ends. */
  until: number;
}

export interface PlayerConfig {
  game: Playing;
  id: PlayerId;
  spawn: { x: number; y: number };
  skin: string;
  name: string;
}

export interface TextConstructorParams {
  scene: Playing;
  x: number;
  y: number;
  text: string;
  style: Phaser.Types.GameObjects.Text.TextStyle;
}

export interface GameData {
  bombs: object;
  id: GameId;
  layer_info: {
    name: string;
    width: number;
    height: number;
    x: number;
    y: number;
    data: number[];
  };
  mapName: string;
  max_players: number;
  name: string;
  playerSpawns: Coordinates[];
  players: Player[];
  shadow_map: number[][];
  spoils: object;
  portals: object;
  tombstones: object;
  createdAt: number;
  isDelaySpoilEnabled: boolean;
  isPortalsEnabled: boolean;
  texturePack: string;
  /** Protocol version of the server. Absent on an older server. */
  protocol?: number;
}

export interface GameSlotsProps {
  data: GameData[];
  onJoinGame: (gameId: string) => void;
}

export interface Player {
  id: PlayerId;
  /** Index of the player in the room; the key of a state snapshot entry. */
  idx: number;
  skin: string;
  name: string;
  spawn: {
    x: number;
    y: number;
  };
  spawnOnGrid: {
    col: number;
    row: number;
  };
  isAlive: boolean;
  isTop3: boolean;
  noKillPhrase: string;
  power: number;
  kills: string[];
}

export interface PlayerSlot {
  name: string;
  image: string;
  id: number;
}

//Stores

export interface GameStore {
  gameName: string;
  changeGameName: (name: string) => void;
}

export type pickedSpoilSocketData = {
  player_id: PlayerId;
  spoil_id: number;
  spoil_type: ISpoilType;
};

export interface ITombStone {
  player_id: PlayerId;
  tombId: string;
  col: number;
  row: number;
}

export interface ISpoil {
  id: string;
  spoil_type: ISpoilType;
  col: number;
  row: number;
}

export interface IPortal {
  id: string;
  col: number;
  row: number;
}

export interface ICell {
  col: number;
  row: number;
  type: string;
  destroyed?: boolean;
  spoil?: ISpoil | null;
  portal?: IPortal | null;
}

export interface ShowBombData {
  bomb_id: string;
  playerId: string;
  col: number;
  row: number;
  /** Fuse time in ms. Optional: an older server does not send it. */
  delay?: number;
  /** Server tick of the placement. */
  t: number;
  /** Player ids that stand on the bomb cell and may walk off it. */
  exempt: number[];
}

/** One 30 Hz snapshot: `p` entries are [idx, x, y, seq]. */
export interface StateSnapshot {
  t: number;
  p: [idx: number, x: number, y: number, seq: number][];
}

export interface TeleportData {
  player_id: PlayerId;
  x: number;
  y: number;
  t: number;
  until: number;
}

export type EndReason = "win" | "draw" | "timeout" | "disconnect";

export interface EndGame {
  game_id: GameId;
  new_game_id: GameId;
  prevGameInfo: GameData;
  reason: EndReason;
}

export interface PlayerWin {
  winner: Player;
  prevGameInfo: GameData;
}

export interface UserStats {
  userId: string;
  points: number;
  kills: number;
  wins: number;
  games: number;
  top3: number;
}

export type MapCard = {
  title: string;
  maxPlayers?: number;
  description?: string;
};

export type MapData = {
  mapName: string;
  isPortalsEnabled: boolean;
  isDelaySpoilEnabled: boolean;
  texturePack: string;
};
