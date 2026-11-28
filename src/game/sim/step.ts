import { TILE_SIZE } from "@/utils/constants";

export const KEY_UP = 1;
export const KEY_DOWN = 2;
export const KEY_LEFT = 4;
export const KEY_RIGHT = 8;
export const KEY_BOMB = 16;

export const BODY_SIZE = TILE_SIZE - 3;
export const CELL_BOX = TILE_SIZE - 8;

export type Box = { left: number; top: number; right: number; bottom: number };
export type SimBomb = { id: string; col: number; row: number };
export type SimWorld = {
  isSolidTile(col: number, row: number): boolean;
  bombs: readonly SimBomb[];
};
export type SimPlayerState = {
  x: number;
  y: number;
  speed: number;
  walkOff: readonly string[];
};

export function bodyBox(x: number, y: number): Box {
  const h = BODY_SIZE / 2;
  return { left: x - h, top: y - h, right: x + h, bottom: y + h };
}

export function cellBox(col: number, row: number, size = CELL_BOX): Box {
  const cx = col * TILE_SIZE + TILE_SIZE / 2;
  const cy = row * TILE_SIZE + TILE_SIZE / 2;
  const h = size / 2;
  return { left: cx - h, top: cy - h, right: cx + h, bottom: cy + h };
}

export function overlapArea(a: Box, b: Box): number {
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return w > 0 && h > 0 ? w * h : 0;
}

function solidBoxes(
  body: Box,
  world: SimWorld,
  walkOff: readonly string[],
): Box[] {
  const boxes: Box[] = [];
  const c0 = Math.floor(body.left / TILE_SIZE);
  const c1 = Math.floor(body.right / TILE_SIZE);
  const r0 = Math.floor(body.top / TILE_SIZE);
  const r1 = Math.floor(body.bottom / TILE_SIZE);
  for (let row = r0; row <= r1; row++) {
    for (let col = c0; col <= c1; col++) {
      if (world.isSolidTile(col, row)) {
        boxes.push(cellBox(col, row, TILE_SIZE));
      }
    }
  }
  for (const bomb of world.bombs) {
    if (!walkOff.includes(bomb.id)) {
      boxes.push(cellBox(bomb.col, bomb.row));
    }
  }
  return boxes;
}

function moveAxis(
  pos: number,
  other: number,
  delta: number,
  horizontal: boolean,
  world: SimWorld,
  walkOff: readonly string[],
): number {
  if (delta === 0) {
    return pos;
  }
  const half = BODY_SIZE / 2;
  const make = (p: number) =>
    horizontal ? bodyBox(p, other) : bodyBox(other, p);
  const before = make(pos);
  const target = pos + delta;
  const after = make(target);
  const union: Box = {
    left: Math.min(before.left, after.left),
    top: Math.min(before.top, after.top),
    right: Math.max(before.right, after.right),
    bottom: Math.max(before.bottom, after.bottom),
  };
  let result = target;
  for (const box of solidBoxes(union, world, walkOff)) {
    if (overlapArea(after, box) === 0 || overlapArea(before, box) > 0) {
      continue;
    }
    if (delta > 0) {
      result = Math.min(result, (horizontal ? box.left : box.top) - half);
    } else {
      result = Math.max(result, (horizontal ? box.right : box.bottom) + half);
    }
  }
  return result;
}

export function stepPlayer(
  state: SimPlayerState,
  keys: number,
  dt: number,
  world: SimWorld,
): SimPlayerState {
  const dist = state.speed * dt;
  const vx = keys & KEY_RIGHT ? dist : keys & KEY_LEFT ? -dist : 0;
  const vy = keys & KEY_DOWN ? dist : keys & KEY_UP ? -dist : 0;
  const x = moveAxis(state.x, state.y, vx, true, world, state.walkOff);
  const y = moveAxis(state.y, x, vy, false, world, state.walkOff);
  const body = bodyBox(x, y);
  const walkOff = state.walkOff.filter(id => {
    const bomb = world.bombs.find(b => b.id === id);
    return (
      bomb !== undefined && overlapArea(body, cellBox(bomb.col, bomb.row)) > 0
    );
  });
  return { x, y, speed: state.speed, walkOff };
}
