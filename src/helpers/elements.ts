import Phaser from "phaser";
import {
    TextConstructorParams,
    ButtonConstructorParams,
    TextButtonConstructorParams,
} from "../../src/utils/types";
export class Text extends Phaser.GameObjects.Text {
    constructor({ scene, x, y, text, style }: TextConstructorParams) {
        super(scene, x, y, text, style);
        this.setOrigin(0.5);
        scene.add.existing(this);
    }
}

export class Button extends Phaser.GameObjects.Sprite {
    constructor({
        scene,
        x,
        y,
        asset,
        callback,
        callbackContext,
    }: ButtonConstructorParams) {
        super(scene, x, y, asset);

        this.setInteractive({ useHandCursor: true }).on("pointerup", () => {
            callback.call(callbackContext);
        });

        // Add the button to the scene
        scene.add.existing(this);
    }

    // Enable the button (make it interactive again)
    enable() {
        this.setInteractive();
        this.setAlpha(1); // Optionally, make it fully visible
    }

    // Disable the button (make it non-interactive)
    disable() {
        this.disableInteractive();
        this.setAlpha(0.5); // Optionally, make it semi-transparent
    }
}

export class TextButton extends Phaser.GameObjects.Container {
    private button: Button;
    private text: Phaser.GameObjects.Text;

    constructor({
        scene,
        x,
        y,
        asset,
        callback,
        callbackContext,
        label,
        style,
    }: TextButtonConstructorParams) {
        // Initialize the container at the given position
        super(scene, x, y);

        // Create the button and add it to the container
        this.button = new Button({
            scene,
            x: 0, // Position relative to the container
            y: 0,
            asset,
            callback,
            callbackContext,
        });
        this.add(this.button); // Add the button to the container

        // Create the text and add it to the container
        this.text = new Phaser.GameObjects.Text(scene, 0, 0, label, style);
        this.text.setOrigin(0.5);
        this.add(this.text); // Add the text to the container

        // Add the container to the scene
        scene.add.existing(this);
    }

    disable() {
        this.button.disable();
    }

    enable() {
        this.button.enable();
    }
}

