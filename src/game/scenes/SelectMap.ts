import Phaser from "phaser";
import { AVAILABLE_MAPS } from "../../utils/constants";
import clientSocket from "../../utils/socket";
import { Text, Button } from "../../helpers/elements";

class SelectMap extends Phaser.Scene {
    constructor() {
        super("SelectMap");
    }

    preload() {
        this.load.setPath("assets");
        this.load.image("main_menu_bg", "images/menu/main_menu_bg.png");
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

        new Text({
            scene: this,
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

        // Create semi-transparent blurred background for container
        const mapList = this.add.rectangle(
            0, // Relative to the container center
            0,
            400, // Adjust width
            500, // Adjust height
            0x000000,
            0.5
        );

        // Apply blur effect (replace with an actual blur shader if defined)
        mapList.setPipeline("BlurPipeline"); // This will only affect `containerBG`

        // Create a container to hold the blurred background and map buttons
        const container = this.add.container(
            this.scale.width / 2,
            this.scale.height / 2
        );
        container.add(mapList);

        // Add map buttons to the container
        AVAILABLE_MAPS.forEach((mapName, index) => {
            const button = new Button({
                scene: this,
                x: 0,
                y: -((AVAILABLE_MAPS.length - 1) * 60) / 2 + index * 120,
                asset: `${mapName}_preview`,
                callback: () => this.confirmStageSelection(mapName),
                callbackContext: this,
                overFrame: 1,
                outFrame: 0,
                downFrame: 2,
                upFrame: 0,
            });
            container.add(button);
        });
    }

    private confirmStageSelection(mapName: string) {
        console.log("mapName:", mapName);
        this.scene.start("PendingGame", { gameId: 1 });
        clientSocket.emit(
            "create game",
            mapName,
            this.joinToNewGame.bind(this)
        );
    }

    private joinToNewGame(gameId: number) {
        this.scene.start("PendingGame", { gameId });
    }
}

export default SelectMap;

