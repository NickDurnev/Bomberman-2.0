import Phaser from "phaser";
import { EXPLOSION_TIME, TILE_SIZE } from "@/utils/constants";

type ConstructorParams = {
  scene: Phaser.Scene;
  id: string;
  col: number;
  row: number;
  playerId: string;
  /** Fuse time in ms (the server `delay` from `show bomb`). */
  delay?: number;
};

export class Bomb extends Phaser.GameObjects.Sprite {
  readonly game: Phaser.Scene;
  private playerId: string;
  id: string;

  constructor({
    scene,
    id,
    col,
    row,
    playerId,
    delay = EXPLOSION_TIME,
  }: ConstructorParams) {
    // Calculate the center of the cell
    const centerCol = col * TILE_SIZE + TILE_SIZE / 2;
    const centerRow = row * TILE_SIZE + TILE_SIZE / 2;

    super(scene, centerCol, centerRow, "bomb_tileset");

    this.game = scene;
    this.id = id;
    this.playerId = playerId;

    // Add the bomb sprite to the scene
    this.game.add.existing(this);

    // Enable physics
    this.game.physics.add.existing(this);
    this.setDepth(10);
    this.getBody().setSize(TILE_SIZE - 8, TILE_SIZE - 8);

    this.getBody().setImmovable(true);

    // The bomb grows over its real fuse time
    const growth = this.game.add.tween({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: delay,
      ease: Phaser.Math.Easing.Linear,
      yoyo: false,
      repeat: 0,
    });

    this.once(Phaser.GameObjects.Events.DESTROY, () => growth.stop());

    this.play("bomb");
  }

  protected getBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  public getPlayerId(): string {
    return this.playerId;
  }
}
