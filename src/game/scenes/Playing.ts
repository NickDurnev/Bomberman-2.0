import { findFrom, findAndDestroyFrom } from "../../utils/utils";
import { TILESET, LAYER } from "../../utils/constants";
import Player from "../entities/player";
import EnemyPlayer from "../entities/enemy_player";
import Bomb from "../entities/bomb";
import Spoil from "../entities/spoil";
import FireBlast from "../entities/fire_blast";
import Bone from "../entities/bone";
import { PlayerConfig, ISpoilType } from "../../utils/types";

interface PlayerData {
    id: number;
    spawn: { x: number; y: number };
    skin: string;
}

interface ClientSocket {
    id: number;
    emit(event: string, data?: any): void;
    on(event: string, callback: (...args: any[]) => void): void;
}

declare const clientSocket: ClientSocket; // Assuming clientSocket is globally defined

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

    init(game: any) {
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

    createMap() {
        this.map = this.make.tilemap({
            key: this.currentGame.map_name ?? "hot_map",
        });
        const tileset = this.map.addTilesetImage(TILESET);

        this.blockLayer = this.map.createLayer(LAYER, tileset!)!;

        this.map.setCollisionByProperty({ collides: true }); // Use the property defined in your tileset

        this.bones = this.add.group();
        this.bombs = this.add.group();
        this.spoils = this.add.group();
        this.blasts = this.add.group();
        this.enemies = this.add.group();

        this.physics.world.enable(this.blockLayer); // Changed to use the correct method for enabling physics
    }

    private createPlayers() {
        for (const player of Object.values(
            this.currentGame.players ?? [
                { id: 0, spawn: { x: 50, y: 300 }, skin: "head_Raviel" },
            ]
        ) as PlayerData[]) {
            const setup: PlayerConfig = {
                scene: this,
                id: player.id,
                spawn: player.spawn,
                skin: player.skin,
            };

            // if (player.id === clientSocket.id) {
            this.player = new Player(setup);
            // } else {
            //     this.enemies.add(new EnemyPlayer(setup));
            // }
        }
    }

    private setEventHandlers() {
        this.onMovePlayer.bind(this);
        // clientSocket.on("move player", this.onMovePlayer.bind(this));
        // clientSocket.on("player win", this.onPlayerWin.bind(this));
        // clientSocket.on("show bomb", this.onShowBomb.bind(this));
        // clientSocket.on("detonate bomb", this.onDetonateBomb.bind(this));
        // clientSocket.on("spoil was picked", this.onSpoilWasPicked.bind(this));
        // clientSocket.on("show bones", this.onShowBones.bind(this));
        // clientSocket.on(
        //     "player disconnect",
        //     this.onPlayerDisconnect.bind(this)
        // );
    }

    private onPlayerVsSpoil(player: Player, spoil: Spoil) {
        // clientSocket.emit("pick up spoil", { spoil_id: spoil.id });
        spoil.destroy();
    }

    private onPlayerVsBlast(player: Player, blast: FireBlast) {
        console.log(blast);
        if (player.active) {
            // clientSocket.emit("player died", {
            //     col: player.currentCol(),
            //     row: player.currentRow(),
            // });
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
        // Remove Bomb:
        findAndDestroyFrom(bomb_id, this.bombs);

        // Render Blast:
        for (const cell of blastedCells) {
            this.blasts.add(new FireBlast(this, cell));
        }

        // Destroy Tiles:
        for (const cell of blastedCells) {
            if (!cell.destroyed) {
                continue;
            }

            // Set the tile at (col, row) to an "empty" tile with ID 0 (or the correct ID for an empty tile)
            const emptyTileId = 0; // Replace with the appropriate tile ID for an empty tile
            this.map.putTileAt(
                emptyTileId, // Tile ID for an "empty" tile
                cell.col, // X-coordinate (column) in the tilemap
                cell.row, // Y-coordinate (row) in the tilemap
                true, // Optional: Recalculate faces after placement (set to true or false as needed)
                this.blockLayer // Specify the layer to place the tile in
            );
        }

        // Add Spoils:
        for (const cell of blastedCells) {
            if (!cell.destroyed || !cell.spoil) {
                continue;
            }

            this.spoils.add(new Spoil(this, cell.spoil));
        }
    }

    private onSpoilWasPicked({
        player_id,
        spoil_id,
        spoil_type,
    }: {
        player_id: number;
        spoil_id: number;
        spoil_type: ISpoilType;
    }) {
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
        // clientSocket.emit("leave game");
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

