export type DirectionFlags = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export const DEAD_ZONE = 0.25;

export const NO_DIRECTION: Readonly<DirectionFlags> = Object.freeze({
  up: false,
  down: false,
  left: false,
  right: false,
});

// Mutable singleton. Player holds this reference and reads it every frame.
export const touchInput: DirectionFlags & { bomb: boolean } = {
  up: false,
  down: false,
  left: false,
  right: false,
  bomb: false,
};

export function setDirections(flags: DirectionFlags): void {
  touchInput.up = flags.up;
  touchInput.down = flags.down;
  touchInput.left = flags.left;
  touchInput.right = flags.right;
}

export function setBomb(pressed: boolean): void {
  touchInput.bomb = pressed;
}

export function resetTouchInput(): void {
  setDirections(NO_DIRECTION);
  setBomb(false);
}

const SECTOR_EPSILON = 1e-9;

// Sector 0 = right, counter-clockwise: 2 = up, 4 = left, 6 = down.
// Odd sectors are diagonals (two flags).
const SECTOR_FLAGS: readonly Readonly<DirectionFlags>[] = [
  { up: false, down: false, left: false, right: true },
  { up: true, down: false, left: false, right: true },
  { up: true, down: false, left: false, right: false },
  { up: true, down: false, left: true, right: false },
  { up: false, down: false, left: true, right: false },
  { up: false, down: true, left: true, right: false },
  { up: false, down: true, left: false, right: false },
  { up: false, down: true, left: false, right: true },
];

/**
 * Maps a stick offset to 8-way digital direction flags.
 * dx, dy are screen px from the base center (y grows downward).
 * radius is the base radius in px. Distance beyond the base gives the same result.
 */
export function stickToDirections(
  dx: number,
  dy: number,
  radius: number,
): DirectionFlags {
  if (Math.hypot(dx, dy) < radius * DEAD_ZONE) {
    return { ...NO_DIRECTION };
  }
  const angle = Math.atan2(-dy, dx);
  const sector =
    Math.floor(angle / (Math.PI / 4) + 0.5 + SECTOR_EPSILON + 8) % 8;
  return { ...SECTOR_FLAGS[sector] };
}
