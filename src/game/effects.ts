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

// Debris and pickup bursts: few, short-lived particles from a pooled emitter.
export const PARTICLE_KEY = "particle";
const MAX_BURST = 12;
const DEBRIS_COUNT = 10;
const PICKUP_COUNT = 8;
const PARTICLE_LIFESPAN = 450;
const DEBRIS_TINT = 0xb8864b;
const PICKUP_TINT = 0xffe36b;

type BurstKind = "debris" | "pickup";

const burstEmitters = new WeakMap<
  Phaser.Scene,
  Partial<Record<BurstKind, Phaser.GameObjects.Particles.ParticleEmitter>>
>();

const getBurstEmitter = (
  scene: Phaser.Scene,
  kind: BurstKind,
): Phaser.GameObjects.Particles.ParticleEmitter => {
  const pool = burstEmitters.get(scene) ?? {};
  burstEmitters.set(scene, pool);
  const cached = pool[kind];
  if (cached?.active) {
    return cached;
  }
  const isDebris = kind === "debris";
  const emitter = scene.add
    .particles(0, 0, PARTICLE_KEY, {
      lifespan: { min: PARTICLE_LIFESPAN / 2, max: PARTICLE_LIFESPAN },
      speed: isDebris ? { min: 40, max: 130 } : { min: 30, max: 90 },
      scale: { start: isDebris ? 1.4 : 1.1, end: 0 },
      alpha: { start: 1, end: 0 },
      gravityY: isDebris ? 220 : -60,
      tint: isDebris ? DEBRIS_TINT : PICKUP_TINT,
      emitting: false,
    })
    .setDepth(10);
  // The emitter dies with the scene's display list; drop the stale entry.
  emitter.once(Phaser.GameObjects.Events.DESTROY, () => {
    delete pool[kind];
  });
  pool[kind] = emitter;
  return emitter;
};

const burst = (
  scene: Phaser.Scene,
  kind: BurstKind,
  x: number,
  y: number,
  count: number,
): void => {
  if (!getSettings().particles) {
    return;
  }
  getBurstEmitter(scene, kind).explode(Math.min(count, MAX_BURST), x, y);
};

/** Brown debris where a box was destroyed. */
export function debrisBurst(scene: Phaser.Scene, x: number, y: number): void {
  burst(scene, "debris", x, y, DEBRIS_COUNT);
}

/** Yellow sparks where a spoil was picked up. */
export function pickupBurst(scene: Phaser.Scene, x: number, y: number): void {
  burst(scene, "pickup", x, y, PICKUP_COUNT);
}

/** Soft glow on a sprite. WebGL only; no-op on Canvas or when off. */
export function applyGlow(sprite: Phaser.GameObjects.Sprite): void {
  if (!(getSettings().glow && isWebGL(sprite.scene))) {
    return;
  }
  sprite.enableFilters();
  sprite.filters?.internal.addGlow(0xffffff, 2, 0, 1, false, 4, 6);
}
