import Player from "../entities/player";
import EnemyPlayer from "../entities/enemy_player";
import Bomb from "../entities/bomb";
import Spoil from "../entities/spoil";
import FireBlast from "../entities/fire_blast";
import Bone from "../entities/bone";
import { TILESET, LAYER } from "@utils/constants";
import { PlayerConfig, pickedSpoilSocketData, ICell } from "@utils/types";
import clientSocket from "@utils/socket";
import { findFrom, findAndDestroyFrom } from "@utils/utils";
import { getDataFromLocalStorage } from "@utils/local_storage";

interface PlayerData {
    id: number;
    spawn: { x: number; y: number };
    skin: string;
    name: string;
}

// interface ISocket  {
//     id: number;
//     emit(event: string, data?: any): void;
//     on(event: string, callback: (...args: any[]) => void): void;
// }

// declare const socket: ClientSocket; // Assuming clientSocket is globally defined

class Playing extends Phaser.Scene {
    private currentGame: any; // Define the type according to your game object structure
    private player!: Player;
    private bones!: Phaser.GameObjects.Group;
    private bombs!: Phaser.GameObjects.Group;
    private spoils!: Phaser.GameObjects.Group;
    private blasts!: Phaser.GameObjects.Group;
    private enemies!: Phaser.GameObjects.Group;
    private blockLayer!: Phaser.Tilemaps.TilemapLayer;
    private map!: Phaser.Tilemaps.Tilemap;

    constructor() {
        super("Playing");
    }

    preload() {
        // Set the base path for loading assets
        this.load.baseURL = "/";

        // Load menu images and spritesheets
        this.load.image("main_menu", "assets/images/menu/main_menu.png");
        this.load.spritesheet("check_icon", "assets/images/menu/accepts.png", {
            frameWidth: 75,
            frameHeight: 75,
        });

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
        this.load.spritesheet(
            "bone_tileset",
            "assets/images/game/bone_tileset.png",
            {
                frameWidth: 35,
                frameHeight: 35,
            }
        );
        this.load.spritesheet("bomb_tileset", "assets/images/game/bombs.png", {
            frameWidth: 35,
            frameHeight: 35,
        });

        // Load game bonuses and placeholders
        this.load.image(
            "speed_up_bonus",
            "assets/images/game/speed_up_bonus.png"
        );
        this.load.image(
            "speed_up_no_bonus",
            "assets/images/game/speed_up_no_bonus.png"
        );
        this.load.image(
            "delay_up_bonus",
            "assets/images/game/delay_up_bonus.png"
        );
        this.load.image(
            "delay_up_no_bonus",
            "assets/images/game/delay_up_no_bonus.png"
        );
        this.load.image(
            "power_up_bonus",
            "assets/images/game/power_up_bonus.png"
        );
        this.load.image(
            "placeholder_power",
            "assets/images/game/placeholder_power.png"
        );
        this.load.image(
            "placeholder_speed",
            "assets/images/game/placeholder_speed.png"
        );
        this.load.image(
            "placeholder_time",
            "assets/images/game/placeholder_time.png"
        );

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

    init(game: any) {
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

        this.currentGame = game;
    }

    create() {
        this.createMap();
        this.createPlayers();
        this.setEventHandlers();

        this.time.addEvent({
            delay: 400,
            callback: this.stopAnimationLoop,
            callbackScope: this,
            loop: true,
        });
    }

    update() {
        this.physics.collide(this.player, this.blockLayer);
        this.physics.collide(this.player, this.enemies);
        this.physics.collide(this.player, this.bombs);

        this.player.update();

        this.physics.overlap(
            this.player,
            this.spoils,
            (obj1: any, obj2: any) => {
                if (obj1 instanceof Player && obj2 instanceof Spoil) {
                    this.onPlayerVsSpoil(obj1, obj2);
                }
            },
            undefined,
            this
        );

        this.physics.overlap(
            this.player,
            this.blasts,
            (obj1: any, obj2: any) => {
                if (obj1 instanceof Player && obj2 instanceof FireBlast) {
                    this.onPlayerVsBlast(obj1, obj2);
                }
            },
            undefined,
            this
        );
    }

    // onGetGame(game: any) {
    //     console.log("game:", game);
    //     this.currentGame = game;
    // }

    createMap() {
        this.map = this.make.tilemap({
            key: this.currentGame.mapName ?? "default_map",
        });
        const tileset = this.map.addTilesetImage(TILESET);

        this.blockLayer = this.map.createLayer(LAYER, tileset!)!;

        // this.map.setCollisionByProperty({ collides: true }); // Use the property defined in your tileset
        this.map.setCollision([1, 2, 3, 4, 5]);

        this.bones = this.add.group();
        this.bombs = this.add.group();
        this.spoils = this.add.group();
        this.blasts = this.add.group();
        this.enemies = this.add.group();

        // this.physics.world.enable(this.blockLayer); // Changed to use the correct method for enabling physics
    }

    private createPlayers() {
        console.log("this.currentGame.players:", this.currentGame.players);
        for (const player of Object.values(
            this.currentGame.players
        ) as PlayerData[]) {
            const setup: PlayerConfig = {
                scene: this,
                id: player.id,
                spawn: player.spawn,
                skin: player.skin,
                name: player.name,
            };

            const storedSocketId = getDataFromLocalStorage("socket_id");
            if (player.id === storedSocketId) {
                this.player = new Player(setup);
            } else {
                this.enemies.add(new EnemyPlayer(setup));
            }
        }
    }

    private setEventHandlers() {
        this.onMovePlayer.bind(this);
        clientSocket.on("move player", this.onMovePlayer.bind(this));
        clientSocket.on("player win", this.onPlayerWin.bind(this));
        clientSocket.on("show bomb", this.onShowBomb.bind(this));
        clientSocket.on("detonate bomb", this.onDetonateBomb.bind(this));
        clientSocket.on("spoil was picked", this.onSpoilWasPicked.bind(this));
        clientSocket.on("show bones", this.onShowBones.bind(this));
        clientSocket.on(
            "player disconnect",
            this.onPlayerDisconnect.bind(this)
        );
    }

    private onPlayerVsSpoil(player: Player, spoil: Spoil) {
        clientSocket.emit("pick up spoil", { spoil_id: spoil.id });
        spoil.destroy();
    }

    private onPlayerVsBlast(player: Player, blast: FireBlast) {
        console.log(blast);
        if (player.active) {
            clientSocket.emit("player died", {
                col: player.currentCol(),
                row: player.currentRow(),
            });
            player.becomesDead();
        }
    }

    private onMovePlayer({
        player_id,
        x,
        y,
    }: {
        player_id: number;
        x: number;
        y: number;
    }) {
        const enemy = findFrom(player_id, this.enemies);
        if (!enemy) {
            return;
        }

        enemy.goTo({ x, y });
    }

    private stopAnimationLoop() {
        for (const enemy of this.enemies.getChildren()) {
            const enemyPlayer = enemy as EnemyPlayer;
            if (enemyPlayer.lastMoveAt < this.time.now - 200) {
                enemyPlayer.anims.stop();
            }
        }
    }

    private onShowBomb({
        bomb_id,
        col,
        row,
    }: {
        bomb_id: number;
        col: number;
        row: number;
    }) {
        this.bombs.add(new Bomb(this, bomb_id, col, row));
    }

    private onDetonateBomb({
        bomb_id,
        blastedCells,
    }: {
        bomb_id: number;
        blastedCells: any[];
    }) {
        console.log("bomb_id:", bomb_id);
        console.log("blastedCells:", blastedCells);
        // Remove Bomb:
        findAndDestroyFrom(bomb_id, this.bombs);

        // Render Blast:
        for (const cell of blastedCells) {
            this.blasts.add(new FireBlast(this, cell));
        }

        // Destroy Tiles:
        blastedCells.forEach((cell: ICell) => {
            if (cell.destroyed) {
                // Set the tile at (col, row) to an "empty" tile with ID 0 (or the correct ID for an empty tile)
                const emptyTileId = 6; // Replace with the appropriate tile ID for an empty tile
                this.map.putTileAt(
                    emptyTileId, // Tile ID for an "empty" tile
                    cell.col, // X-coordinate (column) in the tilemap
                    cell.row, // Y-coordinate (row) in the tilemap
                    true, // Optional: Recalculate faces after placement (set to true or false as needed)
                    this.blockLayer // Specify the layer to place the tile in
                );

                console.log("this.map:", this.map);
            }
        });
        // for (const cell of blastedCells) {
        //     if (!cell.destroyed) {
        //         continue;
        //     }

        //     // Set the tile at (col, row) to an "empty" tile with ID 0 (or the correct ID for an empty tile)
        //     const emptyTileId = 6; // Replace with the appropriate tile ID for an empty tile
        //     this.map.putTileAt(
        //         emptyTileId, // Tile ID for an "empty" tile
        //         cell.col, // X-coordinate (column) in the tilemap
        //         cell.row, // Y-coordinate (row) in the tilemap
        //         true, // Optional: Recalculate faces after placement (set to true or false as needed)
        //         this.blockLayer // Specify the layer to place the tile in
        //     );
        // }

        // Add Spoils:
        blastedCells.forEach((cell: ICell) => {
            if (cell.destroyed && cell.spoil) {
                this.spoils.add(new Spoil(this, cell.spoil));
            }
        });
        // for (const cell of blastedCells) {
        //     if (!cell.destroyed || !cell.spoil) {
        //         continue;
        //     }

        //     this.spoils.add(new Spoil(this, cell.spoil));
        // }
    }

    private onSpoilWasPicked({
        player_id,
        spoil_id,
        spoil_type,
    }: pickedSpoilSocketData) {
        if (player_id === this.player.id) {
            this.player.pickSpoil(spoil_type);
        }

        findAndDestroyFrom(spoil_id, this.spoils);
    }

    private onShowBones({
        player_id,
        col,
        row,
    }: {
        player_id: number;
        col: number;
        row: number;
    }) {
        this.bones.add(new Bone(this, col, row));
        findAndDestroyFrom(player_id, this.enemies);
    }

    private onPlayerWin(winner_skin?: string) {
        clientSocket.emit("leave game");
        this.scene.start("Win", { winner_skin });
    }

    private onPlayerDisconnect({ player_id }: { player_id: number }) {
        findAndDestroyFrom(player_id, this.enemies);
        if (this.enemies.getChildren().length >= 1) {
            return;
        }
        this.onPlayerWin();
    }
}

export default Playing;

