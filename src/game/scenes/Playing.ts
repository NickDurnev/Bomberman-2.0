import Phaser from "phaser";
import { EventBus } from "@/game/EventBus";
import {
  deathEffect,
  debrisBurst,
  explosionFeedback,
  pickupBurst,
  startFuseWarning,
} from "@/game/effects";
import { playEndTransition } from "@/game/endSequence";
import {
  Bomb,
  EnemyPlayer,
  FireBlast,
  Player,
  Portal,
  Spoil,
  Tombstone,
} from "@/game/entities";
import { SimBomb, SimWorld } from "@/game/sim/step";
import { resetTouchInput } from "@/game/touchInput";
import {
  EXPLOSION_TIME,
  LAYER,
  SOCKET_ID_KEY,
  TICK_MS,
  TILE_SIZE,
  TILESET,
} from "@/utils/constants";
import { getDataFromLocalStorage } from "@/utils/local_storage";
import clientSocket from "@/utils/socket";
import {
  GameData,
  ICell,
  ITombStone,
  PlayerConfig,
  pickedSpoilSocketData,
  ShowBombData,
  StateSnapshot,
  TeleportData,
} from "@/utils/types";
import {
  findAndDestroyByCoordinates,
  findAndDestroyById,
  findById,
} from "@/utils/utils";

type PlayerData = Pick<PlayerConfig, "id" | "name" | "spawn" | "skin"> & {
  idx: number;
};

// Snapshots kept for interpolation.
const MAX_SNAPSHOTS = 10;
// The remote players are drawn this many ticks behind the newest snapshot.
const RENDER_DELAY_TICKS = 2;

// At most this many fixed steps per frame; a longer stall drops the rest.
const MAX_STEPS_PER_FRAME = 3;

class Playing extends Phaser.Scene {
  private currentGame: GameData;
  private player?: Player;
  // Index of the local player in the room (`exempt` in `show bomb`).
  private playerIdx?: number;
  // Time (ms) not yet consumed by fixed 30 Hz steps.
  private stepAccumulator = 0;
  // Last snapshots, oldest first, and when the newest one arrived (scene clock).
  private snapshots: StateSnapshot[] = [];
  private latestArrival = 0;
  private byIdx = new Map<number, Player | EnemyPlayer>();
  // Players in portal transit (by id): shown again once a snapshot reaches `until`.
  private hiddenUntil = new Map<string, number>();
  private portals: Phaser.GameObjects.Group;
  private tombstones: Phaser.GameObjects.Group;
  private bombs: Phaser.GameObjects.Group;
  private spoils: Phaser.GameObjects.Group;
  private blasts: Phaser.GameObjects.Group;
  private enemies: Phaser.GameObjects.Group;
  private blockLayer: Phaser.Tilemaps.TilemapLayer;
  private map: Phaser.Tilemaps.Tilemap;
  private socketHandlers: Array<
    [string, Parameters<typeof clientSocket.on>[1]]
  > = [];
  // One end sequence per match: the first of "player win" / "end game"
  // starts it, the other one reuses the same promise.
  private endSequence: Promise<void> | null = null;
  // Set once shutdown() ran. After an await, the scene may be gone
  // (end game teardown or Phaser.Game destroyed on a route change).
  private isShutDown = false;
  // A hidden tab stops the Phaser loop: release every key on the server.
  private readonly onWindowBlur = () => this.player?.releaseKeys();
  private readonly onVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      this.player?.releaseKeys();
    }
  };

  constructor() {
    super("Playing");
  }

  init(game: GameData) {
    this.currentGame = game;
    this.endSequence = null;
    this.isShutDown = false;
    this.stepAccumulator = 0;
    this.snapshots = [];
    this.latestArrival = 0;
    this.byIdx = new Map();
    this.hiddenUntil = new Map();
    this.playerIdx = undefined;
  }

  create() {
    this.createMap();
    this.createPlayers();
    this.fitCameraToMap();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.fitCameraToMap, this);
    if (this.player) {
      this.cameras.main.startFollow(this.player, true);
    }
    this.setEventHandlers();
    window.addEventListener("blur", this.onWindowBlur);
    document.addEventListener("visibilitychange", this.onVisibilityChange);

    // Guarantee socket listeners are removed on every teardown path —
    // including scene.remove() (GameOver.launchGame) which does not call
    // onEndGame(). Without this, listeners leak across rounds.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.shutdown, this);
  }

  update(_time: number, delta: number) {
    if (this.player) {
      this.stepAccumulator += delta;
      let steps = 0;
      while (this.stepAccumulator >= TICK_MS && steps < MAX_STEPS_PER_FRAME) {
        this.player.fixedUpdate();
        this.stepAccumulator -= TICK_MS;
        steps++;
      }
      if (this.stepAccumulator >= TICK_MS) {
        this.stepAccumulator %= TICK_MS;
      }
      this.player.render(this.stepAccumulator / TICK_MS, delta);
    }

    this.renderRemotePlayers();
  }

  public getGameId() {
    return this.currentGame.id;
  }

  /** The map and bombs as the prediction step sees them. */
  public getSimWorld(): SimWorld {
    const bombs: SimBomb[] = [];
    for (const child of this.bombs.getChildren()) {
      const bomb = child as Bomb;
      bombs.push({
        id: String(bomb.id),
        col: Math.floor(bomb.x / TILE_SIZE),
        row: Math.floor(bomb.y / TILE_SIZE),
      });
    }
    return {
      isSolidTile: (col, row) => {
        const tile = this.blockLayer.getTileAt(col, row, true);
        // Outside the map is solid, as on the server.
        return !tile || (tile.index >= 1 && tile.index <= 5);
      },
      bombs,
    };
  }

  private createMap() {
    this.map = this.make.tilemap({
      key: this.currentGame.mapName ?? "default_map",
    });

    const tileset = this.map.addTilesetImage(TILESET);

    this.blockLayer = this.map.createLayer(
      LAYER,
      tileset!,
    ) as Phaser.Tilemaps.TilemapLayer; // no `gpu` option, so the runtime type is TilemapLayer

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
        this.playerIdx = player.idx;
        this.byIdx.set(player.idx, this.player);
      } else {
        const enemy = new EnemyPlayer(setup);
        this.enemies.add(enemy);
        this.byIdx.set(player.idx, enemy);
      }
    }
  }

  private setEventHandlers() {
    // Bind once and keep the references, so shutdown() can remove the
    // exact same function objects (socket.off matches by reference).
    this.socketHandlers = [
      ["state", this.onState.bind(this)],
      ["teleport player", this.onTeleportPlayer.bind(this)],
      ["player win", this.onPlayerWin.bind(this)],
      ["end game", this.onEndGame.bind(this)],
      ["show bomb", this.onShowBomb.bind(this)],
      ["detonate bomb", this.onDetonateBomb.bind(this)],
      ["spoil was picked", this.onSpoilWasPicked.bind(this)],
      ["show tombstone", this.onShowTombstone.bind(this)],
      ["player disconnect", this.onPlayerDisconnect.bind(this)],
    ];

    for (const [event, handler] of this.socketHandlers) {
      clientSocket.on(event, handler);
    }
  }

  private onState(snapshot: StateSnapshot) {
    this.snapshots.push(snapshot);
    if (this.snapshots.length > MAX_SNAPSHOTS) {
      this.snapshots.shift();
    }
    this.latestArrival = this.time.now;
    this.revealAfterTransit(snapshot.t);

    if (this.player && this.playerIdx !== undefined) {
      const own = snapshot.p.find(([idx]) => idx === this.playerIdx);
      if (own) {
        this.player.reconcile(own[1], own[2], own[3]);
      }
    }
  }

  /** Place every remote player between the two snapshots around the render tick. */
  private renderRemotePlayers() {
    const latest = this.snapshots[this.snapshots.length - 1];
    if (!latest) {
      return;
    }
    const renderT = Math.min(
      latest.t,
      latest.t -
        RENDER_DELAY_TICKS +
        (this.time.now - this.latestArrival) / TICK_MS,
    );

    for (const [idx, entity] of this.byIdx) {
      if (!(entity instanceof EnemyPlayer) || !entity.active) {
        continue;
      }
      let before: [number, number, number, number] | undefined;
      let beforeT = 0;
      let after: [number, number, number, number] | undefined;
      let afterT = 0;
      for (const snap of this.snapshots) {
        const entry = snap.p.find(([i]) => i === idx);
        if (!entry) {
          continue;
        }
        if (snap.t <= renderT) {
          before = entry;
          beforeT = snap.t;
        } else if (!after) {
          after = entry;
          afterT = snap.t;
        }
      }
      if (before && after) {
        const k = (renderT - beforeT) / (afterT - beforeT);
        entity.showAt(
          before[1] + (after[1] - before[1]) * k,
          before[2] + (after[2] - before[2]) * k,
        );
      } else if (before ?? after) {
        // Past the newest snapshot with this player: hold its last position.
        const held = (before ?? after) as [number, number, number, number];
        entity.showAt(held[1], held[2]);
      } else {
        entity.showAt(entity.x, entity.y);
      }
    }
  }

  private onTeleportPlayer({ player_id, x, y, until }: TeleportData) {
    const target =
      this.player && this.player.id === player_id
        ? this.player
        : findById(player_id, this.enemies);
    if (!(target instanceof Player || target instanceof EnemyPlayer)) {
      return;
    }
    if (target instanceof Player) {
      target.teleportTo(x, y);
    }
    // Enemies move with the snapshots, which carry the new position.
    this.hiddenUntil.set(player_id, until);
    target.setVisible(false);
    target.playerText.setVisible(false);
    if (target instanceof Player) {
      // Inactive: fixedUpdate sends no input during transit.
      target.setActive(false);
    }
  }

  /** Show the players whose transit ended at snapshot tick `t`. */
  private revealAfterTransit(t: number) {
    for (const [playerId, until] of this.hiddenUntil) {
      if (t < until) {
        continue;
      }
      this.hiddenUntil.delete(playerId);
      const target =
        this.player && this.player.id === playerId
          ? this.player
          : findById(playerId, this.enemies);
      if (target instanceof Player || target instanceof EnemyPlayer) {
        target.setVisible(true);
        target.playerText.setVisible(true);
        target.setActive(true);
      }
    }
  }

  private onShowBomb({
    bomb_id,
    playerId,
    col,
    row,
    delay = EXPLOSION_TIME,
    exempt,
  }: ShowBombData) {
    const bomb = new Bomb({
      scene: this,
      id: bomb_id,
      col,
      row,
      playerId,
      delay,
    });
    this.bombs.add(bomb);
    if (
      this.player &&
      this.playerIdx !== undefined &&
      exempt?.includes(this.playerIdx)
    ) {
      this.player.addWalkOff(String(bomb_id));
    }
    startFuseWarning(bomb, delay);
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
    // Remove Bomb:
    findAndDestroyById(bomb_id, this.bombs);

    explosionFeedback(
      this,
      blastedCells,
      this.player
        ? { x: this.player.x, y: this.player.y, isAlive: this.player.active }
        : null,
    );

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
        debrisBurst(
          this,
          cell.col * TILE_SIZE + TILE_SIZE / 2,
          cell.row * TILE_SIZE + TILE_SIZE / 2,
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
    if (this.player && player_id === this.player.id) {
      this.player.pickSpoil(spoil_type);
    }

    const spoil = findById(spoil_id, this.spoils);
    if (spoil) {
      pickupBurst(this, spoil.x, spoil.y);
    }
    findAndDestroyById(spoil_id, this.spoils);
  }

  private onShowTombstone(tombstone: ITombStone) {
    this.hiddenUntil.delete(tombstone.player_id);
    if (this.player && tombstone.player_id === this.player.id) {
      this.player.becomesDead();
      deathEffect(this);
    }
    this.tombstones.add(new Tombstone(this, tombstone));
    findAndDestroyById(tombstone.player_id, this.enemies);
  }

  private onPlayerWin() {
    void this.startEndSequence();
  }

  // Never rejects: onEndGame awaits it, and its teardown must always run.
  private startEndSequence(): Promise<void> {
    if (!this.endSequence) {
      this.endSequence = this.runEndSequence();
    }
    return this.endSequence;
  }

  private async runEndSequence() {
    try {
      await playEndTransition(this);
    } catch (error) {
      console.error("End transition failed", error);
    }

    if (this.isShutDown) {
      return;
    }
    try {
      EventBus.emit("show-results");
    } catch (error) {
      console.error("show-results listener failed", error);
    }
  }

  private async onEndGame() {
    await this.startEndSequence();

    // The scene may have shut down during the await (a second "end game"
    // already tore it down, or PhaserGame destroyed the game on a route
    // change). Never tear down twice.
    if (this.isShutDown || !this.sys.isActive()) {
      return;
    }

    clientSocket.emit("leave game");

    if (this.player) {
      this.player.resetProperties();
      this.player.removeKeyboard();
      this.player.destroy(true);
    }

    // Destroy game objects and groups
    this.tombstones.destroy(true, true);
    this.bombs.destroy(true, true);
    this.spoils.destroy(true, true);
    this.blasts.destroy(true, true);
    this.enemies.destroy(true, true);

    this.tweens.killAll();
    this.time.removeAllEvents();

    this.shutdown();
    // Properly stop this scene before transitioning
    this.scene.stop("Playing");
  }

  shutdown() {
    this.isShutDown = true;
    window.removeEventListener("blur", this.onWindowBlur);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.scale.off(Phaser.Scale.Events.RESIZE, this.fitCameraToMap, this);
    for (const [event, handler] of this.socketHandlers) {
      clientSocket.off(event, handler);
    }
    this.socketHandlers = [];
    resetTouchInput();
  }

  // Phaser clamps the scroll to the camera bounds, so a map smaller than the
  // view would sit in the top-left corner. Grow the bounds to the view with
  // the map in the middle; a bigger map keeps its own bounds and scrolls.
  private fitCameraToMap() {
    const camera = this.cameras.main;
    const { widthInPixels: width, heightInPixels: height } = this.map;
    const padX = Math.max(0, camera.width - width) / 2;
    const padY = Math.max(0, camera.height - height) / 2;
    camera.setBounds(-padX, -padY, width + 2 * padX, height + 2 * padY);
  }

  // Only remove the enemy sprite. The server decides whether the match
  // ends and sends "end game"; never emit "leave game" from here.
  private onPlayerDisconnect({ player_id }: { player_id: string }) {
    findAndDestroyById(player_id, this.enemies);
  }
}

export default Playing;
