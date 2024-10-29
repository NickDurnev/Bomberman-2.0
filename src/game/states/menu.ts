import Phaser from "phaser";
import { Text, TextButton, GameSlots } from "../../helpers/elements";
import {
    TextConstructorParams,
    TextButtonConstructorParams,
    GameSlotsConstructorParams,
} from "../../utils/types";

interface GameData {
    id: number;
    name: string;
    // Define other properties of game data here if necessary
}

class Menu extends Phaser.Scene {
    private slotsWithGame: GameSlots | null = null;

    constructor() {
        super({ key: "Menu" });
    }

    init(): void {
        this.slotsWithGame = null;

        // Uncomment when clientSocket is available
        // clientSocket.on(
        //     "display pending games",
        //     this.displayPendingGames.bind(this)
        // );
    }

    create(): void {
        const background = this.add.image(
            this.scale.width / 2,
            this.scale.height / 2,
            "main_menu"
        );
        background.setOrigin(0.5);

        new Text({
            scene: this,
            x: this.scale.width / 2,
            y: this.scale.height / 2 - 215,
            text: "Main Menu",
            style: {
                font: "35px Arial",
                fill: "#9ec0ba",
                stroke: "#7f9995",
                strokeThickness: 3,
            },
        } as TextConstructorParams);

        new TextButton({
            scene: this,
            x: this.scale.width / 2,
            y: this.scale.height / 2 + 195,
            asset: "buttons",
            callback: this.hostGameAction.bind(this),
            callbackContext: this,
            overFrame: 1,
            outFrame: 0,
            downFrame: 2,
            upFrame: 0,
            label: "New Game",
            style: {
                font: "20px Arial",
                fill: "#000000",
            },
        } as TextButtonConstructorParams);

        // Uncomment when clientSocket is available
        // clientSocket.emit("enter lobby", this.displayPendingGames.bind(this));
    }

    update(): void {
        // Logic for updates (if any)
    }

    private hostGameAction(): void {
        // Uncomment when clientSocket is available
        // clientSocket.emit("leave lobby");
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
        // Uncomment when clientSocket is available
        // clientSocket.emit("leave lobby");
        this.scene.start("PendingGame", { game_id });
    }
}

export default Menu;

