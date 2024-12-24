import { Physics } from "phaser";
import { TILE_SIZE, EXPLOSION_TIME } from "../../utils/constants";

export default class Bomb extends Phaser.GameObjects.Sprite {
    game: Phaser.Scene;
    id: number;

    constructor(scene: Phaser.Scene, id: number, col: number, row: number) {
        const centerCol = col * TILE_SIZE;
        console.log("centerCol:", centerCol);
        const centerRow = row * TILE_SIZE;
        console.log("centerRow:", centerRow);

        super(scene, centerCol, centerRow, "bomb_tileset");

        this.game = scene;
        this.id = id;

        // Add the bomb sprite to the scene
        this.game.add.existing(this);

        // Enable physics
        this.game.physics.add.existing(this);
        this.getBody().setSize(TILE_SIZE, TILE_SIZE);
        // this.game.physics.world.enable(this);

        // Cast the body to the correct type
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setImmovable(true);

        // Set scale and origin (center)
        // this.setScale(0.7);
        // this.setOrigin(0.5);

        // Add tween for scale animation
        this.game.add.tween({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: EXPLOSION_TIME,
            ease: Phaser.Math.Easing.Linear,
            yoyo: false,
            repeat: 0,
        });

        // Add bomb animation
        this.anims.create({
            key: "bomb",
            frames: this.anims.generateFrameNumbers("bomb_tileset", {
                start: 0,
                end: 13,
            }),
            frameRate: 6,
            repeat: -1,
        });

        this.play("bomb");
    }

    protected getBody(): Physics.Arcade.Body {
        return this.body as Physics.Arcade.Body;
    }

    update() {
        // This would display the debug body, if needed
        // this.game.debug.body(this);
    }
}

