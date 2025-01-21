import Player from "../entities/player";
import EnemyPlayer from "../entities/enemy_player";
import Bomb from "../entities/bomb";
import Spoil from "../entities/spoil";
import FireBlast from "../entities/fire_blast";
import Tombstone from "../entities/tombstone";
import { TILESET, LAYER } from "@utils/constants";
import {
    PlayerConfig,
    pickedSpoilSocketData,
    ICell,
    ITombStone,
} from "@utils/types";
import clientSocket from "@utils/socket";
import {
    findById,
    findAndDestroyByCoordinates,
    findAndDestroyById,
} from "@utils/utils";
import { getDataFromLocalStorage } from "@utils/local_storage";

type PlayerData = Pick<PlayerConfig, "id" | "name" | "spawn" | "skin">;

// interface ISocket  {
//     id: number;
//     emit(event: string, data?: any): void;
//     on(event: string, callback: (...args: any[]) => void): void;
// }

// declare const socket: ClientSocket; // Assuming clientSocket is globally defined

class Playing extends Phaser.Scene {
    private currentGame: any; // Define the type according to your game object structure
    private player: Player;
    private tombstones: Phaser.GameObjects.Group;
    private bombs: Phaser.GameObjects.Group;
    private spoils: Phaser.GameObjects.Group;
    private blasts: Phaser.GameObjects.Group;
    private enemies: Phaser.GameObjects.Group;
    private blockLayer: Phaser.Tilemaps.TilemapLayer;
    private map: Phaser.Tilemaps.Tilemap;

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
                    const playerId = obj2.getPlayerId();
                    this.onPlayerVsBlast(obj1, playerId);
                }
            },
            undefined,
            this
        );
    }

    getGameId() {
        return this.currentGame.id;
    }

    createMap() {
        this.map = this.make.tilemap({
            key: this.currentGame.mapName ?? "default_map",
        });
        const tileset = this.map.addTilesetImage(TILESET);

        this.blockLayer = this.map.createLayer(LAYER, tileset!)!;

        this.map.setCollision([1, 2, 3, 4, 5]);

        this.tombstones = this.add.group();
        this.bombs = this.add.group();
        this.spoils = this.add.group();
        this.blasts = this.add.group();
        this.enemies = this.add.group();
    }

    private createPlayers() {
        for (const player of Object.values(
            this.currentGame.players
        ) as PlayerData[]) {
            const setup: PlayerConfig = {
                game: this,
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
        clientSocket.on("end game", this.onEndGame.bind(this));
        // clientSocket.on("player win", this.onPlayerWin.bind(this));
        clientSocket.on("show bomb", this.onShowBomb.bind(this));
        clientSocket.on("detonate bomb", this.onDetonateBomb.bind(this));
        clientSocket.on("spoil was picked", this.onSpoilWasPicked.bind(this));
        clientSocket.on("show tombstone", this.onShowTombstone.bind(this));
        clientSocket.on(
            "player disconnect",
            this.onPlayerDisconnect.bind(this)
        );
    }

    private onPlayerVsSpoil(player: Player, spoil: Spoil) {
        clientSocket.emit("pick up spoil", {
            spoil_id: spoil.id,
            playerId: player.id,
            gameId: player.gameId,
        });
        spoil.destroy();
    }

    private onPlayerVsBlast(player: Player, killerId: string) {
        if (player.active) {
            clientSocket.emit("player died", {
                col: player.currentCol(),
                row: player.currentRow(),
                playerId: player.id,
                killerId,
                gameId: player.gameId,
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
        const enemy = findById(player_id, this.enemies);
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
        playerId,
        col,
        row,
    }: {
        bomb_id: number;
        playerId: string;
        col: number;
        row: number;
    }) {
        this.player.increaseActiveBombs();
        this.bombs.add(
            new Bomb({
                scene: this,
                id: bomb_id,
                col,
                row,
                playerId,
            })
        );
    }

    private onDetonateBomb({
        bomb_id,
        playerId,
        blastedCells,
    }: {
        bomb_id: number;
        playerId: string;
        blastedCells: any[];
    }) {
        this.player.decreaseActiveBombs();
        // Remove Bomb:
        findAndDestroyById(bomb_id, this.bombs);

        // Render Blast:
        for (const cell of blastedCells) {
            this.blasts.add(new FireBlast(this, cell, playerId));
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
            }
        });

        // Add Spoils:
        blastedCells.forEach((cell: ICell) => {
            if (cell.destroyed && cell.spoil) {
                this.spoils.add(new Spoil(this, cell.spoil));
            } else {
                findAndDestroyByCoordinates(cell.col, cell.row, this.spoils);
            }
        });
    }

    private onSpoilWasPicked({
        player_id,
        spoil_id,
        spoil_type,
    }: pickedSpoilSocketData) {
        if (player_id === this.player.id) {
            this.player.pickSpoil(spoil_type);
        }

        findAndDestroyById(spoil_id, this.spoils);
    }

    private onShowTombstone({ player_id, tombId, col, row }: ITombStone) {
        this.tombstones.add(new Tombstone(this, tombId, col, row));
        findAndDestroyById(player_id, this.enemies);
    }

    // private onPlayerWin(player?: Player) {
    //     clientSocket.emit("leave game");
    //     console.log(player);
    //     this.game.destroy(true);
    //     this.scene.start("GameOver");
    // }

    private onEndGame() {
        // Emit socket event
        clientSocket.emit("leave game");

        // Destroy game objects and groups
        if (this.tombstones) this.tombstones.destroy(true);
        if (this.bombs) this.bombs.destroy(true);
        if (this.spoils) this.spoils.destroy(true);
        if (this.blasts) this.blasts.destroy(true);
        if (this.enemies) this.enemies.destroy(true);

        // Remove any lingering event listeners or tweens
        this.tweens.killAll();
        this.time.removeAllEvents();

        this.scene.start("GameOver");
    }

    private onPlayerDisconnect({ player_id }: { player_id: number }) {
        findAndDestroyById(player_id, this.enemies);
        if (this.enemies.getChildren().length >= 1) {
            return;
        }
        this.onEndGame();
    }
}

export default Playing;

