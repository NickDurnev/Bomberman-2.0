import Phaser from "phaser";

class Preloader extends Phaser.Scene {
    constructor() {
        super({ key: "Preloader" });
    }

    init() {
        // Add a background image for the main menu
        this.add.image(512, 384, "main_menu_bg");

        // Draw a simple progress bar outline
        const progressBarOutline = this.add.rectangle(512, 384, 468, 32);
        progressBarOutline.setStrokeStyle(2, 0xffffff);

        // Create the loading bar that fills as assets are loaded
        const progressBar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        // Update the progress bar width based on the load progress
        this.load.on("progress", (progress: number) => {
            progressBar.width = 4 + 460 * progress;
        });
    }

    preload() {
        // Set the base path for loading assets
        this.load.setPath("assets");

        // Load menu images and spritesheets
        this.load.image("main_menu", "images/menu/main_menu.png");
        this.load.spritesheet("check_icon", "images/menu/accepts.png", {
            frameWidth: 75,
            frameHeight: 75,
        });

        // Load map assets
        this.load.image("tiles", "maps/tileset.png");
        this.load.tilemapTiledJSON("default_map", "maps/default_map.json");
        this.load.tilemapTiledJSON("cold_map", "maps/cold_map.json");

        // Load game spritesheets
        this.load.spritesheet(
            "explosion_center",
            "images/game/explosion_center.png",
            { frameWidth: 35, frameHeight: 35 }
        );
        this.load.spritesheet(
            "explosion_horizontal",
            "images/game/explosion_horizontal.png",
            { frameWidth: 35, frameHeight: 35 }
        );
        this.load.spritesheet(
            "explosion_vertical",
            "images/game/explosion_vertical.png",
            { frameWidth: 35, frameHeight: 35 }
        );
        this.load.spritesheet("explosion_up", "images/game/explosion_up.png", {
            frameWidth: 35,
            frameHeight: 35,
        });
        this.load.spritesheet(
            "explosion_right",
            "images/game/explosion_right.png",
            { frameWidth: 35, frameHeight: 35 }
        );
        this.load.spritesheet(
            "explosion_down",
            "images/game/explosion_down.png",
            { frameWidth: 35, frameHeight: 35 }
        );
        this.load.spritesheet(
            "explosion_left",
            "images/game/explosion_left.png",
            { frameWidth: 35, frameHeight: 35 }
        );
        this.load.spritesheet(
            "spoil_tileset",
            "images/game/spoil_tileset.png",
            { frameWidth: 35, frameHeight: 35 }
        );
        this.load.spritesheet("bone_tileset", "images/game/bone_tileset.png", {
            frameWidth: 35,
            frameHeight: 35,
        });
        this.load.spritesheet("bomb_tileset", "images/game/bombs.png", {
            frameWidth: 35,
            frameHeight: 35,
        });

        // Load game bonuses and placeholders
        this.load.image("speed_up_bonus", "images/game/speed_up_bonus.png");
        this.load.image(
            "speed_up_no_bonus",
            "images/game/speed_up_no_bonus.png"
        );
        this.load.image("delay_up_bonus", "images/game/delay_up_bonus.png");
        this.load.image(
            "delay_up_no_bonus",
            "images/game/delay_up_no_bonus.png"
        );
        this.load.image("power_up_bonus", "images/game/power_up_bonus.png");
        this.load.image(
            "placeholder_power",
            "images/game/placeholder_power.png"
        );
        this.load.image(
            "placeholder_speed",
            "images/game/placeholder_speed.png"
        );
        this.load.image("placeholder_time", "images/game/placeholder_time.png");

        this.load.image("batman", "images/game/avatars/batman.png");

        // Load character head images
        // this.load.image("bomberman_head_blank", "images/game/chars/0-face.png");
        // this.load.image(
        //     "bomberman_head_Theodora",
        //     "images/game/chars/1-face.png"
        // );
        // this.load.image("bomberman_head_Ringo", "images/game/chars/2-face.png");
        // this.load.image(
        //     "bomberman_head_Jeniffer",
        //     "images/game/chars/3-face.png"
        // );
        // this.load.image(
        //     "bomberman_head_Godard",
        //     "images/game/chars/4-face.png"
        // );
        // this.load.image(
        //     "bomberman_head_Biarid",
        //     "images/game/chars/5-face.png"
        // );
        // this.load.image("bomberman_head_Solia", "images/game/chars/6-face.png");
        // this.load.image("bomberman_head_Kedan", "images/game/chars/7-face.png");
        // this.load.image("bomberman_head_Nigob", "images/game/chars/8-face.png");
        // this.load.image(
        //     "bomberman_head_Baradir",
        //     "images/game/chars/9-face.png"
        // );
        // this.load.image(
        //     "bomberman_head_Raviel",
        //     "images/game/chars/10-face.png"
        // );
        // this.load.image(
        //     "bomberman_head_Valpo",
        //     "images/game/chars/11-face.png"
        // );

        // Load character spritesheets
        // this.load.spritesheet(
        //     "bomberman_Theodora",
        //     "images/game/chars/1-preview.png",
        //     { frameWidth: 32, frameHeight: 32 }
        // );
        // this.load.spritesheet(
        //     "bomberman_Ringo",
        //     "images/game/chars/2-preview.png",
        //     { frameWidth: 32, frameHeight: 32 }
        // );
        // this.load.spritesheet(
        //     "bomberman_Jeniffer",
        //     "images/game/chars/3-preview.png",
        //     { frameWidth: 32, frameHeight: 32 }
        // );
        // this.load.spritesheet(
        //     "bomberman_Godard",
        //     "images/game/chars/4-preview.png",
        //     { frameWidth: 32, frameHeight: 32 }
        // );
        // this.load.spritesheet(
        //     "bomberman_Biarid",
        //     "images/game/chars/5-preview.png",
        //     { frameWidth: 32, frameHeight: 32 }
        // );
        // this.load.spritesheet(
        //     "bomberman_Solia",
        //     "images/game/chars/6-preview.png",
        //     { frameWidth: 32, frameHeight: 32 }
        // );
        // this.load.spritesheet(
        //     "bomberman_Kedan",
        //     "images/game/chars/7-preview.png",
        //     { frameWidth: 32, frameHeight: 32 }
        // );
        // this.load.spritesheet(
        //     "bomberman_Nigob",
        //     "images/game/chars/8-preview.png",
        //     { frameWidth: 32, frameHeight: 32 }
        // );
        // this.load.spritesheet(
        //     "bomberman_Baradir",
        //     "images/game/chars/9-preview.png",
        //     { frameWidth: 32, frameHeight: 32 }
        // );
        // this.load.spritesheet(
        //     "bomberman_Raviel",
        //     "images/game/chars/10-preview.png",
        //     { frameWidth: 32, frameHeight: 32 }
        // );
        // this.load.spritesheet(
        //     "bomberman_Valpo",
        //     "images/game/chars/11-preview.png",
        //     { frameWidth: 32, frameHeight: 32 }
        // );
    }

    create() {
        // Transition to the main menu scene
        this.scene.start("Playing");
    }
}

export default Preloader;

