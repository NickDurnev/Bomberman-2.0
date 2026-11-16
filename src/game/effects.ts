import Phaser from "phaser";
import { TILE_SIZE } from "@/utils/constants";
import { getSettings } from "@/utils/settings";

// The fuse warning starts this long before the bomb explodes.
const FUSE_WARNING_TIME = 500;
// One tint step of the warning pulse.
const FUSE_PULSE_STEP = 100;
const FUSE_PULSE_TINTS = [0xffffff, null, 0xff3030, null] as const;

// An explosion closer than this to the local player shakes the camera.
const FEEDBACK_RANGE = 3 * TILE_SIZE;
const SHAKE_DURATION = 150;
const SHAKE_INTENSITY = 0.004;
const FLASH_DURATION = 80;

export const isWebGL = (scene: Phaser.Scene): boolean =>
  scene.renderer.type === Phaser.WEBGL;

/**
 * Pulses a tint on the bomb in the last FUSE_WARNING_TIME ms of its fuse
 * (at once when the fuse is shorter). Runs until the sprite is destroyed.
 */
export function startFuseWarning(
  bomb: Phaser.GameObjects.Sprite,
  delayMs: number,
): void {
  if (!getSettings().fuseWarning) {
    return;
  }
  const scene = bomb.scene;
  let step = 0;
  let pulse: Phaser.Time.TimerEvent | null = null;

  const tick = () => {
    const tint = FUSE_PULSE_TINTS[step % FUSE_PULSE_TINTS.length];
    step += 1;
    if (tint === null) {
      bomb.clearTint();
    } else {
      bomb.setTint(tint).setTintMode(Phaser.TintModes.FILL);
    }
  };

  const start = scene.time.delayedCall(
    Math.max(0, delayMs - FUSE_WARNING_TIME),
    () => {
      tick();
      pulse = scene.time.addEvent({
        delay: FUSE_PULSE_STEP,
        loop: true,
        callback: tick,
      });
    },
  );

  bomb.once(Phaser.GameObjects.Events.DESTROY, () => {
    start.remove(false);
    pulse?.remove(false);
  });
}

/**
 * Shakes and flashes the camera when a blasted cell is near the local
 * living player. Short and small: the board must stay readable.
 */
export function explosionFeedback(
  scene: Phaser.Scene,
  blastedCells: { row: number; col: number }[],
  player: { x: number; y: number; isAlive: boolean } | null,
): void {
  if (!player?.isAlive || !getSettings().screenShake) {
    return;
  }
  const isNear = blastedCells.some(
    ({ col, row }) =>
      Phaser.Math.Distance.Between(
        col * TILE_SIZE + TILE_SIZE / 2,
        row * TILE_SIZE + TILE_SIZE / 2,
        player.x,
        player.y,
      ) <= FEEDBACK_RANGE,
  );
  if (!isNear) {
    return;
  }
  const camera = scene.cameras.main;
  camera.shake(SHAKE_DURATION, SHAKE_INTENSITY);
  camera.flash(FLASH_DURATION, 255, 240, 200);
}
