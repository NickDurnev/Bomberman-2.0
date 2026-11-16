import Phaser from "phaser";

/**
 * Visual transition that runs once at the end of a match, before the
 * results modal opens. It resolves when the transition is done.
 * For now it resolves at once (the board simply stays).
 */
export function playEndTransition(_scene: Phaser.Scene): Promise<void> {
  return Promise.resolve();
}
