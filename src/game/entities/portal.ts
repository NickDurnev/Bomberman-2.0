import { Physics } from "phaser";
import { TILE_SIZE } from "@utils/constants";
import { IPortal } from "@utils/types";

export class Portal extends Phaser.GameObjects.Sprite {
    readonly game: Phaser.Scene;
    id: string;

    constructor(scene: Phaser.Scene, portal: IPortal) {
        // Calculate the center of the cell
        const centerCol = portal.col * TILE_SIZE + TILE_SIZE / 2;
        const centerRow = portal.row * TILE_SIZE + TILE_SIZE / 2;

        super(scene, centerCol, centerRow, "portal_tileset");

        this.game = scene;
        this.id = portal.id;

        // Add the portal sprite to the scene
        this.game.add.existing(this);
        this.setDepth(1);

        // Enable physics
        this.game.physics.add.existing(this);
        this.getBody().setSize(TILE_SIZE - 8, TILE_SIZE - 8);

        this.getBody().setImmovable(true);

        // Add bomb animation
        this.anims.create({
            key: "portal",
            frames: this.anims.generateFrameNumbers("portal_tileset", {
                start: 0,
                end: 14,
            }),
            frameRate: 20,
            repeat: -1,
        });

        this.play("portal");
    }

    protected getBody(): Physics.Arcade.Body {
        return this.body as Physics.Arcade.Body;
    }
}

