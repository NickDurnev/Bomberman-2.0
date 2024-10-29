import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { RenderLevel } from "../../utils/renderLevel"; // Import the RenderLevel class
import {
    GRID_WIDTH,
    GRID_HEIGHT,
    TILE_SIZE,
    CEL_GAP,
    BASE_MAP,
} from "../../utils/constants";
export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    field: Phaser.GameObjects.Grid;
    renderLevel: RenderLevel; // Declare a property to hold the RenderLevel instance

    constructor() {
        //TODO = "Return Game name";
        super("Game");
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.spritesheet("wall", "assets/wall.png", {
            frameWidth: 48,
            frameHeight: 48,
        });
        this.load.spritesheet("bomb", "assets/bomb.png", {
            frameWidth: 48,
            frameHeight: 48,
        });
        this.load.spritesheet("explosion", "assets/explosion.png", {
            frameWidth: 48,
            frameHeight: 48,
        });
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x5c5756);

        // Define the grid, accounting for the cell gap
        this.field = this.add.grid(
            512, // x position of the grid
            384, // y position of the grid
            GRID_WIDTH, // total grid width
            GRID_HEIGHT, // total grid height
            TILE_SIZE + CEL_GAP, // cell width (tileSize + gap)
            TILE_SIZE + CEL_GAP, // cell height (tileSize + gap)
            0x292828, // line color
            0x292828, // line color
            0.5 // fill alpha
        );

        this.anims.create({
            key: "explode",
            frames: this.anims.generateFrameNumbers("explosion"),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true,
        });

        // Instantiate RenderLevel and pass the current scene (this)
        this.renderLevel = new RenderLevel(this); // Pass the scene itself
        this.renderLevel.createExternalWalls(); // Create the walls around the grid
        this.renderLevel.createInternalWalls(BASE_MAP); // Create the internal walls of the grid

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        this.scene.start("GameOver");
    }
}

