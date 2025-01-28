class Preload extends Phaser.Scene {
    private currentGame: any; // Define the type according to your game object structure

    constructor() {
        super("Preload");
    }

    init(game: any) {
        this.currentGame = game;
        // Draw a simple progress bar outline
        const progressBarOutline = this.add.rectangle(512, 384, 468, 32);
        progressBarOutline.setStrokeStyle(2, 0xffffff);

        // Create the loading bar that fills as assets are loaded
        const progressBar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        const loadQueue: Array<{ id: string; skin: string }> = [];
        let activeRequests = 0;
        const MAX_CONCURRENT_REQUESTS = 1;

        const processQueue = (scene: Phaser.Scene) => {
            if (
                activeRequests >= MAX_CONCURRENT_REQUESTS ||
                loadQueue.length === 0
            ) {
                return;
            }

            const nextItem = loadQueue.shift();

            // Ensure nextItem is defined before accessing its properties
            if (nextItem && !activeRequests) {
                const { id, skin } = nextItem;

                activeRequests++;

                scene.load.image(id, skin);
                scene.load.once("complete", () => {
                    activeRequests--;
                    processQueue(scene); // Process the next item in the queue
                });
                scene.load.start();
            }
        };

        // Add players to the load queue
        game.players.forEach((player: any) => {
            loadQueue.push({ id: player.id, skin: player.skin });
        });

        // Start processing the queue
        processQueue(this);

        // Update the progress bar width based on the load progress
        this.load.on("progress", (progress: number) => {
            progressBar.width = 4 + 460 * progress;
        });
        this.load.start();
    }

    preload() {
        console.log("PRELOAD");
        // Set the base path for loading assets
        this.load.baseURL = "/";

        // Load map assets
        this.load.image("tiles", "assets/maps/tileset.png");
        this.load.tilemapTiledJSON(
            "default_map",
            "assets/maps/default_map.json"
        );
        this.load.tilemapTiledJSON("cold_map", "assets/maps/cold_map.json");

        // Load game spritesheets
        this.load.spritesheet(
            "explosion_center",
            "assets/images/game/explosion_center.png",
            { frameWidth: 35, frameHeight: 35 }
        );
        this.load.spritesheet(
            "explosion_horizontal",
            "assets/images/game/explosion_horizontal.png",
            { frameWidth: 35, frameHeight: 35 }
        );
        this.load.spritesheet(
            "explosion_vertical",
            "assets/images/game/explosion_vertical.png",
            { frameWidth: 35, frameHeight: 35 }
        );
        this.load.spritesheet(
            "explosion_up",
            "assets/images/game/explosion_up.png",
            {
                frameWidth: 35,
                frameHeight: 35,
            }
        );
        this.load.spritesheet(
            "explosion_right",
            "assets/images/game/explosion_right.png",
            { frameWidth: 35, frameHeight: 35 }
        );
        this.load.spritesheet(
            "explosion_down",
            "assets/images/game/explosion_down.png",
            { frameWidth: 35, frameHeight: 35 }
        );
        this.load.spritesheet(
            "explosion_left",
            "assets/images/game/explosion_left.png",
            { frameWidth: 35, frameHeight: 35 }
        );
        this.load.spritesheet(
            "spoil_tileset",
            "assets/images/game/spoil_tileset.png",
            { frameWidth: 35, frameHeight: 35 }
        );
        this.load.spritesheet("tombstone", "assets/images/game/tombstone.png", {
            frameWidth: 35,
            frameHeight: 35,
        });
        this.load.spritesheet("bomb_tileset", "assets/images/game/bombs.png", {
            frameWidth: 35,
            frameHeight: 35,
        });

        //Default avatars
        this.load.image("avatar-1", "assets/images/avatars/avatar-1.png");
        this.load.image("avatar-2", "assets/images/avatars/avatar-2.png");
        this.load.image("avatar-3", "assets/images/avatars/avatar-3.png");
        this.load.image("avatar-4", "assets/images/avatars/avatar-4.png");
        this.load.image("avatar-5", "assets/images/avatars/avatar-5.png");
        this.load.image("avatar-6", "assets/images/avatars/avatar-6.png");
        this.load.image("avatar-7", "assets/images/avatars/avatar-7.png");
        this.load.image("avatar-8", "assets/images/avatars/avatar-8.png");
        this.load.image("avatar-9", "assets/images/avatars/avatar-9.png");
        this.load.image("avatar-10", "assets/images/avatars/avatar-10.png");
        this.load.image("avatar-11", "assets/images/avatars/avatar-11.png");
        this.load.image("avatar-12", "assets/images/avatars/avatar-12.png");
        this.load.image("avatar-13", "assets/images/avatars/avatar-13.png");
        this.load.image("avatar-14", "assets/images/avatars/avatar-14.png");
        this.load.image("avatar-15", "assets/images/avatars/avatar-15.png");
        this.load.image("avatar-16", "assets/images/avatars/avatar-16.png");
    }

    create() {
        this.scene.start("Playing", this.currentGame);
    }
}

export default Preload;

