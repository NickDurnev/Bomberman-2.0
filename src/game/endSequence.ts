import Phaser from "phaser";
import { isWebGL } from "@/game/effects";

// The wipe must end well before the 1500 ms fallback that opens the
// results modal when "end game" arrives first.
const END_TRANSITION_TIME = 1000;
// Resolve even if no completion event ever arrives.
const SAFETY_MARGIN = 300;

/**
 * Visual transition that runs once at the end of a match, before the
 * results modal opens. It resolves when the transition is done.
 * WebGL: a camera Wipe filter. Canvas: a camera fade-out.
 * Resolves at once when the scene is not active.
 */
export function playEndTransition(scene: Phaser.Scene): Promise<void> {
  if (!scene.sys.isActive()) {
    return Promise.resolve();
  }
  const camera = scene.cameras.main;

  return new Promise<void>(resolve => {
    let done = false;
    const finish = () => {
      if (done) {
        return;
      }
      done = true;
      window.clearTimeout(safety);
      scene.events.off(Phaser.Scenes.Events.SHUTDOWN, finish);
      scene.events.off(Phaser.Scenes.Events.DESTROY, finish);
      camera.off(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, finish);
      resolve();
    };
    const safety = window.setTimeout(
      finish,
      END_TRANSITION_TIME + SAFETY_MARGIN,
    );
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, finish);
    scene.events.once(Phaser.Scenes.Events.DESTROY, finish);

    if (isWebGL(scene)) {
      const wipe = camera.filters.external.addWipe(0.1, 0, 0);
      scene.tweens.add({
        targets: wipe,
        progress: 1,
        duration: END_TRANSITION_TIME,
        ease: Phaser.Math.Easing.Linear,
        onComplete: finish,
        onStop: finish,
      });
    } else {
      camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, finish);
      camera.fadeOut(END_TRANSITION_TIME);
    }
  });
}
