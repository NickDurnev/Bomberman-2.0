import Phaser from "phaser";

import {
    Bomb,
    EnemyPlayer,
    FireBlast,
    Player,
    Portal,
    Spoil,
    Tombstone,
} from "@game/entities";
import {
    LAYER,
    PORTAL_DELAY,
    PORTAL_DELAY_STEP,
    SOCKET_ID_KEY,
    TILESET,
} from "@utils/constants";
import { getDataFromLocalStorage } from "@utils/local_storage";
import clientSocket from "@utils/socket";
import {
    GameData,
    ICell,
    ITombStone,
    PlayerConfig,
    PlayerPositionData,
    pickedSpoilSocketData,
} from "@utils/types";
import {
    findAndDestroyByCoordinates,
    findAndDestroyById,
    findByCoordinates,
    findById,
    getIntersectionArea,
} from "@utils/utils";

type PlayerData = Pick<PlayerConfig, "id" | "name" | "spawn" | "skin">;

class Playing extends Phaser.Scene {
    private currentGame: GameData;
    private player: Player;
    private portals: Phaser.GameObjects.Group;
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

    init(game: GameData) {
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
        // Only set up collisions if the player exists and is active
        if (this.player && this.player.active) {
            this.physics.collide(this.player, this.blockLayer);
            this.physics.collide(this.player, this.bombs);
        }

        // Update player if it exists
        if (this.player) {
            this.player.update();
        }

        // Set up overlaps only if the player exists and is active
        if (this.player && this.player.active) {
            this.physics.overlap(
                this.player,
                this.spoils,
                (obj1, obj2) => {
                    if (obj1 instanceof Player && obj2 instanceof Spoil) {
                        this.onPlayerVsSpoil(obj1, obj2);
                    }
                },
                undefined,
                this,
            );

            this.physics.overlap(
                this.player,
                this.portals,
                (obj1, obj2) => {
                    if (obj1 instanceof Player && obj2 instanceof Portal) {
                        this.onPlayerVsPortal(obj1, obj2);
                    }
                },
                undefined,
                this,
            );

            this.physics.overlap(
                this.player,
                this.blasts,
                (obj1, obj2) => {
                    if (obj1 instanceof Player && obj2 instanceof FireBlast) {
                        const intersectionArea = getIntersectionArea(
                            obj1 as any,
                            obj2 as any,
                        );

                        if (
                            obj1.body &&
                            "width" in obj1.body &&
                            "height" in obj1.body
                        ) {
                            const playerArea =
                                obj1.body.width * obj1.body.height;

                            // Only trigger if at least 10% of the player is overlapping
                            if (intersectionArea >= playerArea / 10) {
                                const playerId = obj2.getPlayerId();
                                this.onPlayerVsBlast(obj1, playerId);
                            }
                        }
                    }
                },
                undefined,
                this,
            );
        }

        // Set up bomb-blast overlap if both groups exist
        if (this.bombs && this.blasts) {
            this.physics.overlap(
                this.bombs,
                this.blasts,
                (obj1, obj2) => {
                    if (obj1 instanceof Bomb && obj2 instanceof FireBlast) {
                        this.onBombVsBlast(obj1);
                    }
                },
                undefined,
                this,
            );
        }
    }

    public getGameId() {
        return this.currentGame.id;
    }

    public checkBombByColumnAndRow(column: number, row: number) {
        return findByCoordinates(column, row, this.bombs);
    }

    private createMap() {
        this.map = this.make.tilemap({
            key: this.currentGame.mapName ?? "default_map",
        });

        const tileset = this.map.addTilesetImage(TILESET);

        this.blockLayer = this.map.createLayer(LAYER, tileset!)!;

        this.map.setCollision([1, 2, 3, 4, 5]);

        this.portals = this.add.group();
        this.tombstones = this.add.group();
        this.bombs = this.add.group();
        this.spoils = this.add.group();
        this.blasts = this.add.group();
        this.enemies = this.add.group();
    }

    private createPlayers() {
        for (const player of Object.values(
            this.currentGame.players,
        ) as PlayerData[]) {
            const setup: PlayerConfig = {
                game: this,
                id: player.id,
                spawn: player.spawn,
                skin: player.skin,
                name: player.name,
            };

            const storedSocketId = getDataFromLocalStorage(SOCKET_ID_KEY);
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
        clientSocket.on("teleport player", this.onTeleportPlayer.bind(this));
        clientSocket.on("end game", this.onEndGame.bind(this));
        // clientSocket.on("player win", this.onPlayerWin.bind(this));
        clientSocket.on("show bomb", this.onShowBomb.bind(this));
        clientSocket.on("detonate bomb", this.onDetonateBomb.bind(this));
        clientSocket.on("spoil was picked", this.onSpoilWasPicked.bind(this));
        clientSocket.on("show tombstone", this.onShowTombstone.bind(this));
        clientSocket.on(
            "player disconnect",
            this.onPlayerDisconnect.bind(this),
        );
    }

    private onPlayerVsPortal(player: Player, portal: Portal) {
        const now = this.time.now;

        if (now - player.lastTeleportTime < PORTAL_DELAY) {
            return;
        }

        player.lastTeleportTime = now; // Update the last teleport time
        clientSocket.emit("use portal", {
            portal_id: portal.id,
            playerId: player.id,
            gameId: player.gameId,
        });

        // Make player and their text invisible and disable physics interactions
        player.setVisible(false);
        player.playerText.setVisible(false); // <-- Hide the player text
        player.getBody().enable = false;
        player.setActive(false);

        // Set a timer to re-enable visibility and physics after teleportation
        this.time.delayedCall(PORTAL_DELAY_STEP, () => {
            player.setVisible(true);
            player.playerText.setVisible(true); // <-- Show the player text
            player.getBody().enable = true;
            player.setActive(true);
        });
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
        clientSocket.emit("player died", {
            col: player.currentCol(),
            row: player.currentRow(),
            playerId: player.id,
            killerId,
            gameId: player.gameId,
        });
        player.becomesDead();
    }

    private onBombVsBlast(bomb: Bomb) {
        clientSocket.emit("detonate bomb by blast", {
            bomb_id: bomb.id,
            gameId: this.currentGame.id,
            playerId: bomb.getPlayerId(),
        });
    }

    private onMovePlayer({ player_id, x, y }: PlayerPositionData) {
        const enemy = findById(player_id, this.enemies);
        if (enemy) {
            enemy.goTo({ x, y });
        }
    }

    private onTeleportPlayer({ player_id, x, y }: PlayerPositionData) {
        if (this.player.id === player_id) {
            this.player.goTo({ x, y });
        } else {
            this.onMovePlayer({ player_id, x, y });
        }
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
        bomb_id: string;
        playerId: string;
        col: number;
        row: number;
    }) {
        if (this.player.id === playerId) {
            this.player.increaseActiveBombs();
        }
        this.bombs.add(
            new Bomb({
                scene: this,
                id: bomb_id,
                col,
                row,
                playerId,
            }),
        );
    }

    private onDetonateBomb({
        bomb_id,
        playerId,
        blastedCells,
    }: {
        bomb_id: number;
        playerId: string;
        blastedCells: ICell[];
    }) {
        if (this.player.id === playerId) {
            this.player.decreaseActiveBombs();
        }
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
                    this.blockLayer, // Specify the layer to place the tile in
                );
            }
        });

        // Add Spoils:
        blastedCells.forEach((cell: ICell) => {
            if (cell.destroyed && cell.spoil) {
                this.spoils.add(new Spoil(this, cell.spoil));
            } else if (cell.portal) {
                this.portals.add(new Portal(this, cell.portal));
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

    private onShowTombstone(tombstone: ITombStone) {
        this.tombstones.add(new Tombstone(this, tombstone));
        findAndDestroyById(tombstone.player_id, this.enemies);
    }

    private onEndGame() {
        clientSocket.emit("leave game");

        if (this.player) {
            this.player.resetProperties();
            this.player.removeKeyboard();
        }

        // Destroy game objects and groups
        this.tombstones.destroy(true, true);
        this.bombs.destroy(true, true);
        this.spoils.destroy(true, true);
        this.blasts.destroy(true, true);
        this.enemies.destroy(true, true);
        this.player.destroy(true);

        this.tweens.killAll();
        this.time.removeAllEvents();
        this.registry.destroy(); // Destroy registry

        this.shutdown();
        // Properly stop this scene before transitioning
        this.scene.stop("Playing");

        // this.scene.start("GameOver");
    }

    shutdown() {
        clientSocket.off("move player", this.onMovePlayer);
        clientSocket.off("end game", this.onEndGame);
        clientSocket.off("show bomb", this.onShowBomb);
        clientSocket.off("detonate bomb", this.onDetonateBomb);
        clientSocket.off("spoil was picked", this.onSpoilWasPicked);
        clientSocket.off("show tombstone", this.onShowTombstone);
        clientSocket.off("player disconnect", this.onPlayerDisconnect);
    }

    private onPlayerDisconnect({ player_id }: { player_id: string }) {
        findAndDestroyById(player_id, this.enemies);
        if (this.enemies.getChildren().length >= 1) {
            return;
        }
        this.onEndGame();
    }
}

export default Playing;
