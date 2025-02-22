import Phaser from "phaser";
import { TextConstructorParams } from "../../src/utils/types";
export class Text extends Phaser.GameObjects.Text {
    constructor({ scene, x, y, text, style }: TextConstructorParams) {
        super(scene, x, y, text, style);
        this.setOrigin(0.5);
        scene.add.existing(this);
    }
}

