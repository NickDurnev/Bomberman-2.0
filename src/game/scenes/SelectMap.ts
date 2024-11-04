import Phaser from "phaser";
import { AVAILABLE_MAPS } from "../../utils/constants";
import { Text, Button } from "../../helpers/elements";

class SelectMap extends Phaser.Scene {
    constructor() {
        super("SelectMap"); // Specify the key for the scene
    }

    preload() {
        this.load.setPath("assets");

        this.load.image("hot_map_preview", "images/menu/hot_map_preview.png");
        this.load.image("cold_map_preview", "images/menu/cold_map_preview.png");
    }

    create() {
        const background = this.add.image(
            this.scale.width / 2,
            this.scale.height / 2,
            "main_menu_bg"
        );
        background.setOrigin(0.5);

        // Add title text
        new Text({
            scene: this, // Correct property
            x: this.scale.width / 2,
            y: this.scale.height / 2 - 350,
            text: "Select Map",
            style: {
                font: "20px Arial Black semibold",
                color: "#f3f3f3",
                stroke: "#000000",
                strokeThickness: 3,
            },
        });

        AVAILABLE_MAPS.map((mapName, index) => {
            return new Button({
                scene: this, // Correct property
                x: this.scale.width / 2,
                y: this.scale.height / 2 - (index + 1) * 120,
                asset: `${mapName}_preview`,
                callback: () => this.confirmStageSelection(mapName), // Ensure `this` context
                callbackContext: this,
                overFrame: 1,
                outFrame: 0,
                downFrame: 2,
                upFrame: 0,
            });
        });
    }

    // Modify confirmStageSelection to accept mapName
    private confirmStageSelection(mapName: string) {
        console.log("mapName:", mapName);
        this.scene.start("PendingGame", { gameId: 1 });
        // Use mapName in your logic
        // clientSocket.emit(
        //     "create game",
        //     mapName,
        //     this.joinToNewGame.bind(this)
        // );
    }

    private joinToNewGame(gameId: number) {
        this.scene.start("PendingGame", { gameId }); // Use scene's `start` method
    }
}

export default SelectMap;

