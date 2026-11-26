import Phaser from "phaser";
import type { EnemyPlayer } from "@/game/entities/enemy_player";
import { touchInput } from "@/game/touchInput";

const LABEL_TOP = 12;
const LABEL_STYLE = {
  font: "bold 16px Arial",
  fill: "#FFFFFF",
  stroke: "#000000",
  strokeThickness: 4,
} as Phaser.Types.GameObjects.Text.TextStyle;

/**
 * After the local player dies, the camera follows a living player: the killer
 * first, else the first one left. Left and Right (keys or the thumbstick)
 * switch to the previous or next living player. When the followed player
 * dies or leaves, the next one takes over.
 *
 * `enemies` holds only living players: a tombstone or a disconnect destroys
 * the sprite (Playing.onShowTombstone, onPlayerDisconnect).
 */
export class Spectator {
  private readonly scene: Phaser.Scene;
  private readonly enemies: Phaser.GameObjects.Group;
  private readonly label: Phaser.GameObjects.Text;
  private readonly leftKey?: Phaser.Input.Keyboard.Key;
  private readonly rightKey?: Phaser.Input.Keyboard.Key;
  private target: EnemyPlayer | null = null;
  private touchLeft = touchInput.left;
  private touchRight = touchInput.right;
  private destroyed = false;

  constructor(
    scene: Phaser.Scene,
    enemies: Phaser.GameObjects.Group,
    killerId?: string,
  ) {
    this.scene = scene;
    this.enemies = enemies;
    // The same Key objects the dead Player registered: addKey returns them.
    const keyboard = scene.input.keyboard;
    this.leftKey = keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    // A key held at the moment of death must not switch at once.
    for (const key of [this.leftKey, this.rightKey]) {
      if (key) {
        Phaser.Input.Keyboard.JustDown(key);
      }
    }

    this.label = scene.add
      .text(0, LABEL_TOP, "", LABEL_STYLE)
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(100);

    const living = this.living();
    this.follow(living.find(enemy => enemy.id === killerId) ?? living[0]);
  }

  // The name of the followed player, or null. The E2E hook reads it.
  get targetName(): string | null {
    return this.target?.playerText.text ?? null;
  }

  update() {
    if (!this.running()) {
      return;
    }
    const left =
      (this.leftKey && Phaser.Input.Keyboard.JustDown(this.leftKey)) ||
      (touchInput.left && !this.touchLeft);
    const right =
      (this.rightKey && Phaser.Input.Keyboard.JustDown(this.rightKey)) ||
      (touchInput.right && !this.touchRight);
    this.touchLeft = touchInput.left;
    this.touchRight = touchInput.right;

    if (left !== right) {
      this.step(left ? -1 : 1);
    }
    // Another player died or left, or the view was resized. setText redraws
    // only when the text changes.
    if (this.target) {
      this.updateLabel();
    }
  }

  // Before the enemies are destroyed: their DESTROY events must not retarget.
  destroy() {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.target?.off(Phaser.GameObjects.Events.DESTROY, this.onTargetGone);
    this.target = null;
    this.label.destroy();
  }

  // A scene shutdown destroys the enemies and the label before Playing can
  // destroy this: the status is no longer RUNNING by then.
  private running(): boolean {
    return !this.destroyed && this.scene.sys.isActive();
  }

  private living(): EnemyPlayer[] {
    return (this.enemies.getChildren() as EnemyPlayer[]).filter(
      enemy => enemy.active,
    );
  }

  private step(direction: 1 | -1) {
    const living = this.living();
    if (living.length < 2 || !this.target) {
      return;
    }
    const index = living.indexOf(this.target);
    const next = (index + direction + living.length) % living.length;
    this.follow(living[next]);
  }

  private follow(next: EnemyPlayer | undefined) {
    this.target?.off(Phaser.GameObjects.Events.DESTROY, this.onTargetGone);
    this.target = next ?? null;
    const camera = this.scene.cameras.main;

    if (!this.target) {
      camera.stopFollow();
      this.label.setVisible(false);
      return;
    }
    this.target.once(Phaser.GameObjects.Events.DESTROY, this.onTargetGone);
    camera.startFollow(this.target, true);
    this.updateLabel();
  }

  private updateLabel() {
    const hint = this.living().length > 1 ? "   ◀ ▶" : "";
    this.label
      .setText(`Spectating ${this.targetName}${hint}`)
      .setX(this.scene.cameras.main.width / 2)
      .setVisible(true);
  }

  // The followed sprite is being destroyed: never pick it again.
  private onTargetGone = (gone: Phaser.GameObjects.GameObject) => {
    if (!this.running()) {
      return;
    }
    this.target = null;
    this.follow(this.living().find(enemy => enemy !== gone));
  };
}
