import { GameObjects, Scene } from "phaser";
import { EventBus } from "../EventBus";
import { Text, TextButton, GameSlots } from "../../helpers/elements";
import {
    TextConstructorParams,
    TextButtonConstructorParams,
    GameSlotsConstructorParams,
    GameData,
} from "../../utils/types";
import clientSocket from "../../utils/socket";

class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    button: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;

    private slotsWithGame: GameData[] | [] = [];

    constructor() {
        super("MainMenu");
    }

    init(): void {
        this.slotsWithGame = [];

        clientSocket.on(
            "display pending games",
            this.displayPendingGames.bind(this)
        );
    }

    preload() {
        this.load.setPath("assets");

        this.load.image("button", "images/menu/button.png");
    }

    create() {
        const background = this.add.image(
            this.scale.width / 2,
            this.scale.height / 2,
            "main_menu_bg"
        );
        background.setOrigin(0.5);

        new Text({
            scene: this,
            x: this.scale.width / 2,
            y: this.scale.height / 2 - 300,
            text: "Bomberman 2.0",
            style: {
                fontFamily: "Arial Black",
                fontSize: 60,
                fontStyle: "bold",
                color: "#f3f3f3",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            },
        } as TextConstructorParams);

        new TextButton({
            scene: this,
            x: this.scale.width / 2,
            y: this.scale.height / 2 - 200,
            asset: "button",
            callback: this.hostGameAction.bind(this),
            callbackContext: this,
            label: "New Game",
            style: {
                font: "16px Arial Black semibold",
                fill: "#f3f3f3",
            },
        } as TextButtonConstructorParams);

        clientSocket.emit("enter lobby", this.displayPendingGames.bind(this));

        EventBus.emit("current-scene-ready", this);
    }

    update(): void {
        // Logic for updates (if any)
    }

    private hostGameAction(): void {
        clientSocket.emit("leave lobby");
        this.scene.start("SelectMap");
    }

    private displayPendingGames(availableGames: GameData[]): void {
        if (this.slotsWithGame) {
            this.slotsWithGame = [
                ...this.slotsWithGame,
                availableGames[availableGames.length - 1],
            ];
        }

        new GameSlots({
            scene: this,
            data: this.slotsWithGame,
            callback: this.joinGameAction.bind(this),
            callbackContext: this,
        } as GameSlotsConstructorParams);
    }

    joinGameAction({ game_id }: { game_id: string }) {
        clientSocket.emit("leave lobby");
        this.scene.start("PendingGame", { game_id });
    }
}

export default MainMenu;

