import Phaser, { Physics } from "phaser";
import Playing from "@/game/scenes/Playing";
import {
  KEY_BOMB,
  KEY_DOWN,
  KEY_LEFT,
  KEY_RIGHT,
  KEY_UP,
  SimPlayerState,
  stepPlayer,
} from "@/game/sim/step";
import { touchInput } from "@/game/touchInput";
import { Text } from "@/helpers/elements";
import {
  DELAY,
  DT,
  INITIAL_DELAY,
  INITIAL_POWER,
  INITIAL_SPEED,
  MAX_SPEED,
  MIN_DELAY,
  POWER,
  SPEED,
  STEP_DELAY,
  STEP_POWER,
  STEP_SPEED,
  TILE_SIZE,
} from "@/utils/constants";
import clientSocket from "@/utils/socket";
import { ISpoilType, PlayerConfig } from "@/utils/types";
import { setPlayerAvatar } from "@/utils/utils";

// Unacked inputs kept for replay. 90 steps = 3 s at 30 Hz; older entries are
// dropped so the buffer stays bounded when no snapshot arrives.
const MAX_HISTORY = 90;
// A reconcile correction above this distance (px) is eased out, not snapped.
const SMOOTH_THRESHOLD = 1;
// Time constant (ms) of the exponential error decay: ~97% gone after 100 ms.
const SMOOTH_TAU_MS = 30;

export class Player extends Phaser.GameObjects.Sprite {
  readonly game: Playing;
  readonly id: string;
  readonly gameId: string;
  private delay: number;
  private power: number;
  private speed: number;
  private upKey: Phaser.Input.Keyboard.Key;
  private downKey: Phaser.Input.Keyboard.Key;
  private leftKey: Phaser.Input.Keyboard.Key;
  private rightKey: Phaser.Input.Keyboard.Key;
  private spaceKey: Phaser.Input.Keyboard.Key;
  readonly sprite: Phaser.GameObjects.Sprite;
  playerText: Text;
  lastTeleportTime: number = 0;

  /** Predicted state after the last fixed step. */
  sim: SimPlayerState;
  /** Sent inputs not yet acknowledged by a server snapshot. */
  history: { seq: number; keys: number }[] = [];
  private prevSim: { x: number; y: number };
  private seq = 0;
  private lastSentKeys = 0;
  private errorX = 0;
  private errorY = 0;

  constructor({ game, id, spawn, name }: PlayerConfig) {
    const centerCol = spawn.x - TILE_SIZE / 2;
    const centerRow = spawn.y - TILE_SIZE / 2;

    // The texture key is the player id (see Preload). No frame: the name is
    // not a frame, and setPlayerAvatar sets the final texture.
    super(game, centerCol, centerRow, id);

    this.game = game;
    this.id = id;
    this.gameId = game.getGameId();
    this.delay = INITIAL_DELAY;
    this.power = INITIAL_POWER;
    this.speed = INITIAL_SPEED;
    this.sim = { x: centerCol, y: centerRow, speed: this.speed, walkOff: [] };
    this.prevSim = { x: centerCol, y: centerRow };

    this.game.add.existing(this);
    // The body stays for effect overlaps only. Its velocity stays 0: the
    // position comes from the predicted state every frame.
    this.game.physics.add.existing(this);
    this.setDepth(10);

    setPlayerAvatar(this, id);

    //DEBUG
    // this.game.physics.world.createDebugGraphic();
    // this.getBody().debugBodyColor = 0xff0000;

    this.defineText(name);
    this.defineKeyboard();
  }

  getBody(): Physics.Arcade.Body {
    return this.body as Physics.Arcade.Body;
  }

  private defineKeyboard() {
    this.upKey = this.game.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.UP,
    );
    this.downKey = this.game.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.DOWN,
    );
    this.leftKey = this.game.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.LEFT,
    );
    this.rightKey = this.game.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
    );
    this.spaceKey = this.game.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
  }

  private defineText(name: string) {
    const style = {
      font: "14px Arial",
      fill: "#493D9E",
      stroke: "#000000",
      strokeThickness: 3,
    } as Phaser.Types.GameObjects.Text.TextStyle;

    this.playerText = this.game.add.text(
      this.x,
      this.y - TILE_SIZE * 1.2,
      name,
      style,
    );

    this.playerText.setX(this.x - this.playerText.width / 2);
    this.playerText.setDepth(10);
  }

  private sampleKeys(): number {
    let keys = 0;
    if (this.upKey?.isDown || touchInput.up) {
      keys |= KEY_UP;
    }
    if (this.downKey?.isDown || touchInput.down) {
      keys |= KEY_DOWN;
    }
    if (this.leftKey?.isDown || touchInput.left) {
      keys |= KEY_LEFT;
    }
    if (this.rightKey?.isDown || touchInput.right) {
      keys |= KEY_RIGHT;
    }
    if (this.spaceKey?.isDown || touchInput.bomb) {
      keys |= KEY_BOMB;
    }
    return keys;
  }

  private sendInput(keys: number) {
    this.seq += 1;
    this.history.push({ seq: this.seq, keys });
    if (this.history.length > MAX_HISTORY) {
      this.history.shift();
    }
    this.lastSentKeys = keys;
    clientSocket.emit("input", { seq: this.seq, keys });
  }

  /** One 30 Hz step: sample, send, predict. */
  fixedUpdate() {
    this.prevSim = { x: this.sim.x, y: this.sim.y };
    if (!this.active) {
      return;
    }

    const keys = this.sampleKeys();
    // One all-zero input on release, then nothing while idle.
    if (keys !== 0 || keys !== this.lastSentKeys) {
      this.sendInput(keys);
    }
    this.sim = stepPlayer(this.sim, keys, DT, this.game.getSimWorld());
  }

  /**
   * Resets the prediction to the server position and replays the inputs the
   * server has not consumed yet (seq > ackSeq).
   */
  reconcile(serverX: number, serverY: number, ackSeq: number) {
    this.history = this.history.filter(entry => entry.seq > ackSeq);

    const oldX = this.sim.x;
    const oldY = this.sim.y;
    const world = this.game.getSimWorld();
    let state: SimPlayerState = {
      x: serverX,
      y: serverY,
      speed: this.speed,
      walkOff: this.sim.walkOff,
    };
    for (const entry of this.history) {
      state = stepPlayer(state, entry.keys, DT, world);
    }
    this.sim = state;

    // Move the interpolation segment with the correction, and keep the shown
    // position where it was through the error offset, which then decays.
    const dx = state.x - oldX;
    const dy = state.y - oldY;
    this.prevSim = { x: this.prevSim.x + dx, y: this.prevSim.y + dy };
    if (Math.hypot(dx, dy) > SMOOTH_THRESHOLD) {
      this.errorX -= dx;
      this.errorY -= dy;
    }
  }

  /** Sends an all-up input, e.g. when the tab loses focus. */
  releaseKeys() {
    this.sendInput(0);
  }

  /** Snaps the prediction to a teleport target (no smoothing). */
  teleportTo(x: number, y: number) {
    this.sim = { ...this.sim, x, y };
    this.prevSim = { x, y };
    this.errorX = 0;
    this.errorY = 0;
    this.render(1, 0);
  }

  /** The server lets this player walk off the bomb (`show bomb` `exempt`). */
  addWalkOff(bombId: string) {
    if (!this.sim.walkOff.includes(bombId)) {
      this.sim = { ...this.sim, walkOff: [...this.sim.walkOff, bombId] };
    }
  }

  /**
   * Draws the sprite between the previous and the current predicted
   * positions. `alpha` is the fraction of the next step already elapsed.
   */
  render(alpha: number, deltaMs: number) {
    if (this.errorX !== 0 || this.errorY !== 0) {
      const decay = Math.exp(-deltaMs / SMOOTH_TAU_MS);
      this.errorX *= decay;
      this.errorY *= decay;
      if (Math.hypot(this.errorX, this.errorY) < 0.1) {
        this.errorX = 0;
        this.errorY = 0;
      }
    }

    const x = this.prevSim.x + (this.sim.x - this.prevSim.x) * alpha;
    const y = this.prevSim.y + (this.sim.y - this.prevSim.y) * alpha;
    this.setPosition(x + this.errorX, y + this.errorY);

    if (this.playerText) {
      this.playerText.setPosition(
        this.x - this.playerText.width / 2,
        this.y - TILE_SIZE * 1.2,
      );
    }
  }

  currentCol() {
    return Math.floor(this.x / TILE_SIZE);
  }

  currentRow() {
    return Math.floor(this.y / TILE_SIZE);
  }

  becomesDead() {
    this.setActive(false);
    this.setVisible(false);
  }

  pickSpoil(spoilType: ISpoilType) {
    if (spoilType === SPEED) {
      this.increaseSpeed();
    } else if (spoilType === POWER) {
      this.increasePower();
    } else if (spoilType === DELAY) {
      this.decreaseDelay();
    }
  }

  increaseSpeed() {
    if (this.speed < MAX_SPEED) {
      this.speed += STEP_SPEED;
      this.sim = { ...this.sim, speed: this.speed };
    }
  }

  decreaseDelay() {
    if (this.delay > MIN_DELAY) {
      this.delay -= STEP_DELAY;
    }
  }

  increasePower() {
    this.power += STEP_POWER;
  }

  resetProperties() {
    this.delay = INITIAL_DELAY;
    this.power = INITIAL_POWER;
    this.speed = INITIAL_SPEED;
    this.sim = { ...this.sim, speed: this.speed };
  }

  removeKeyboard() {
    this.game.input.keyboard?.removeKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.game.input.keyboard?.removeKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    this.game.input.keyboard?.removeKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.game.input.keyboard?.removeKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.game.input.keyboard?.removeKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }
}
