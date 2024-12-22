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
    scene: Phaser.Scene;
    id: number;
    spawn: { x: number; y: number };
    skin: string;
    name: string;
}

export interface TextConstructorParams {
    scene: Phaser.Scene;
    x: number;
    y: number;
    text: string;
    style: Phaser.Types.GameObjects.Text.TextStyle;
}

export interface ButtonConstructorParams {
    scene: Phaser.Scene;
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

export interface GameSlotsConstructorParams {
    scene: Phaser.Scene;
    data: GameData[];
    callback: (params: { game_id: string }) => void;
    callbackContext?: unknown;
}

export interface PlayerSlotsConstructorParams {
    scene: Phaser.Scene;
    max_players: number;
    players: { skin: string }[];
    asset_empty: string;
    asset_player: string;
    style: Phaser.Types.GameObjects.Text.TextStyle;
}

export interface SpoilNotificationConstructorParams {
    scene: Phaser.Scene;
    asset: string;
    x: number;
    y: number;
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
    map_name: string;
    max_players: number;
    name: string;
    playerSkins: string[];
    playerSpawns: Spawn[];
    players: object;
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

export interface PlayerSlotsProps {
    max_players: number;
    players: Player[];
}

//Stores

export interface GameStore {
    gameName: string;
    changeGameName: (name: string) => void;
}

export type pickedSpoilSocketData = {
    player_id: number;
    spoil_id: number;
    spoil_type: ISpoilType;
};

