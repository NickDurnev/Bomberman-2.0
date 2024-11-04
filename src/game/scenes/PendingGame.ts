import Phaser from "phaser";
import { Text, TextButton, PlayerSlots } from "../../helpers/elements";
import {
    TextButtonConstructorParams,
    PlayerSlotsConstructorParams,
} from "../../utils/types";

interface GameInfo {
    name: string;
    players: Record<string, any>;
    max_players: number;
}

interface GameData {
    current_game: GameInfo;
}

interface InitData {
    game_id: number;
}

class PendingGame extends Phaser.Scene {
    private game_id: number;
    private gameTitle: Text;
    private startGameButton: TextButton;
    private slotsWithPlayer: PlayerSlots | null = null;

    constructor() {
        super("PendingGame");
    }

    init({ game_id }: InitData): void {
        this.game_id = game_id;

        // clientSocket.on("update game", this.displayGameInfo.bind(this));
        // clientSocket.on("launch game", this.launchGame.bind(this));

        // clientSocket.emit("enter pending game", { game_id: this.game_id });
    }

    preload() {
        this.load.setPath("assets");

        this.load.image("button", "images/menu/button.png");
    }

    create(): void {
        const background = this.add.image(
            this.scale.width / 2,
            this.scale.height / 2,
            "main_menu_bg"
        );
        background.setOrigin(0.5);

        this.gameTitle = new Text({
            scene: this,
            x: this.scale.width / 2,
            y: this.scale.height / 2 - 215,
            text: "",
            style: {
                font: "35px Arial Black semibold",
                color: "#f3f3f3",
                stroke: "#000000",
                strokeThickness: 3,
            },
        });

        this.startGameButton = new TextButton({
            scene: this,
            x: this.scale.width / 2,
            y: this.scale.height / 2 + 195,
            asset: "button",
            callback: this.startGameAction.bind(this),
            callbackContext: this,
            overFrame: 1,
            outFrame: 0,
            downFrame: 2,
            upFrame: 0,
            label: "Start Game",
            style: {
                font: "16px Arial Black semibold",
                fill: "#f3f3f3",
            },
        } as TextButtonConstructorParams);

        // this.startGameButton.disable();

        new TextButton({
            scene: this,
            x: this.scale.width / 2,
            y: this.scale.height / 2 + 50,
            asset: "button",
            callback: this.leaveGameAction.bind(this),
            callbackContext: this,
            overFrame: 1,
            outFrame: 0,
            downFrame: 2,
            upFrame: 0,
            label: "Leave Game",
            style: {
                font: "16px Arial Black semibold",
                fill: "#f3f3f3",
            },
        } as TextButtonConstructorParams);
    }

    displayGameInfo({ current_game }: GameData): void {
        const players = Object.values(current_game.players);

        this.gameTitle.text = current_game.name;

        if (this.slotsWithPlayer) {
            this.slotsWithPlayer.destroy();
        }

        this.slotsWithPlayer = new PlayerSlots({
            scene: this,
            max_players: current_game.max_players,
            players: players,
            x: this.scale.width / 2 - 245,
            y: this.scale.height / 2 - 200,
            asset_empty: "bomberman_head_blank",
            asset_player: "bomberman_head_",
            style: {
                font: "35px Arial",
                fill: "#efefef",
                stroke: "#ae743a",
                strokeThickness: 3,
            },
        } as PlayerSlotsConstructorParams);

        if (players.length > 1) {
            this.startGameButton.enable();
        } else {
            this.startGameButton.disable();
        }
    }

    leaveGameAction(): void {
        // clientSocket.emit("leave pending game");
        this.scene.start("Menu");
    }

    startGameAction(): void {
        console.log(123);
        this.scene.start("Playing", this);
        // clientSocket.emit("start game");
    }

    launchGame(game: any): void {
        this.scene.start("Playing", game);
    }
}

export default PendingGame;

