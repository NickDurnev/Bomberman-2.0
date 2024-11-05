import { GameObjects, Scene } from "phaser";
import { EventBus } from "../EventBus";
import { Text, TextButton, GameSlots } from "../../helpers/elements";
import {
    TextConstructorParams,
    TextButtonConstructorParams,
    GameSlotsConstructorParams,
} from "../../utils/types";
import clientSocket from "../../utils/socket";

interface GameData {
    id: number;
    name: string;
    // Define other properties of game data here if necessary
}

class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    button: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;

    private slotsWithGame: GameSlots | null = null;

    constructor() {
        super("MainMenu");
    }

    init(): void {
        this.slotsWithGame = null;

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
            y: this.scale.height / 2 + 195,
            asset: "button",
            callback: this.hostGameAction.bind(this),
            callbackContext: this,
            overFrame: 1,
            outFrame: 0,
            downFrame: 2,
            upFrame: 0,
            label: "New Game",
            style: {
                font: "16px Arial Black semibold",
                fill: "#f3f3f3",
            },
        } as TextButtonConstructorParams);

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
            this.slotsWithGame.destroy();
        }

        this.slotsWithGame = new GameSlots({
            scene: this,
            availableGames,
            callback: this.joinGameAction.bind(this),
            callbackContext: this,
            x: this.scale.width / 2 - 220,
            y: 160,
            style: {
                font: "35px Arial",
                fill: "#efefef",
                stroke: "#ae743a",
                strokeThickness: 3,
            },
        } as GameSlotsConstructorParams);
    }

    joinGameAction({ game_id }: { game_id: number }) {
        clientSocket.emit("leave lobby");
        this.scene.start("PendingGame", { game_id });
    }
}

export default MainMenu;

