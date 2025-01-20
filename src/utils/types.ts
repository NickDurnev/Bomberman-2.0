import Playing from "@game/scenes/Playing";

export interface IUser {
    email: string;
    locale: string;
    name: string;
    picture: string;
    socketID: string;
    _id?: string;
}

export type ISpoilType = 0 | 1 | 2 | 3;

export interface Spawn {
    x: number;
    y: number;
}

export interface PlayerConfig {
    game: Playing;
    id: string;
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

export interface ButtonConstructorParams {
    scene: Playing;
    x: number;
    y: number;
    asset: string;
    callback: () => void;
    callbackContext: unknown;
}

export interface TextButtonConstructorParams extends ButtonConstructorParams {
    label: string;
    style: Phaser.Types.GameObjects.Text.TextStyle;
}

export interface GameData {
    bombs: object;
    id: string;
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
    playerSpawns: Spawn[];
    players: Player[];
    shadow_map: number[][];
    spoils: object;
}

export interface GameSlotsProps {
    data: GameData[];
    onJoinGame: (gameId: string) => void;
}

export interface Player {
    id: string;
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
    power: number;
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
    player_id: string;
    spoil_id: number;
    spoil_type: ISpoilType;
};

export interface ITombStone {
    player_id: string;
    tombId: string;
    col: number;
    row: number;
}

export interface ISpoil {
    id: number;
    spoil_type: ISpoilType;
    col: number;
    row: number;
}

export interface ICell {
    col: number;
    row: number;
    type: string;
    destroyed?: boolean;
    spoil?: ISpoil | null;
}

export interface EndGame {
    game_id: string;
    new_game_id: string;
}

