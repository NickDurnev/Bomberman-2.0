export type ISpoilType = 0 | 1 | 2;

export interface Spawn {
    x: number;
    y: number;
}

export interface PlayerConfig {
    scene: Phaser.Scene;
    id: number;
    spawn: { x: number; y: number };
    skin: string;
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
    overFrame: string | number;
    outFrame: string | number;
    downFrame: string | number;
    upFrame: string | number;
}

export interface TextButtonConstructorParams extends ButtonConstructorParams {
    label: string;
    style: Phaser.Types.GameObjects.Text.TextStyle;
}

export interface GameSlotsConstructorParams {
    scene: Phaser.Scene;
    availableGames: { id: number; name: string }[];
    callback: (params: { game_id: number }) => void;
    callbackContext?: unknown;
    x: number;
    y: number;
    style: Phaser.Types.GameObjects.Text.TextStyle;
}

export interface PlayerSlotsConstructorParams {
    scene: Phaser.Scene;
    max_players: number;
    players: { skin: string }[];
    x: number;
    y: number;
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

