import Phaser from "phaser";
import {
    TextConstructorParams,
    ButtonConstructorParams,
    TextButtonConstructorParams,
    GameSlotsConstructorParams,
    PlayerSlotsConstructorParams,
    SpoilNotificationConstructorParams,
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

export class GameSlots extends Phaser.GameObjects.Group {
    constructor({
        scene,
        data,
        callback,
        callbackContext,
    }: GameSlotsConstructorParams) {
        super(scene);

        new Text({
            scene: scene,
            x: scene.scale.width / 2,
            y: scene.scale.height / 2 - 100,
            text: "Available Games",
            style: {
                font: "25px Arial Black semibold",
                color: "#f3f3f3",
                stroke: "#000000",
                strokeThickness: 3,
            },
        });

        const mapList = scene.add.rectangle(
            0, // Relative to the container center
            120,
            400, // Adjust width
            350, // Adjust height
            0x000000,
            0
        );

        const container = scene.add.container(
            scene.scale.width / 2,
            scene.scale.height / 2
        );
        container.add(mapList);

        // Add map buttons to the container
        data.forEach((availableGame, index) => {
            if (!availableGame) {
                return;
            }
            const button = new TextButton({
                scene,
                x: 0,
                y: 0 + index * 100,
                asset: "button",
                callback: () =>
                    callback.call(callbackContext, {
                        game_id: availableGame?.id,
                    }),
                callbackContext: scene,
                label: `Game ${index + 1}`,
                style: {
                    font: "16px Arial Black semibold",
                    fill: "#f3f3f3",
                },
            } as TextButtonConstructorParams);
            container.add(button);
            if (!availableGame.id) {
                button.disable();
            }
        });
    }

    destroy() {
        this.clear(true); // Phaser 3 uses `clear` instead of `kill`
    }
}

export class PlayerSlots extends Phaser.GameObjects.Group {
    constructor({
        scene,
        max_players,
        players,
        asset_empty,
        asset_player,
        style,
    }: PlayerSlotsConstructorParams) {
        super(scene);

        new Text({
            scene: scene,
            x: scene.scale.width / 2,
            y: scene.scale.height / 2 - 100,
            text: "Players",
            style: {
                font: "25px Arial Black semibold",
                color: "#f3f3f3",
                stroke: "#000000",
                strokeThickness: 3,
            },
        });

        const mapList = scene.add.rectangle(
            0, // Relative to the container center
            120,
            400, // Adjust width
            350, // Adjust height
            0x000000,
            0
        );

        const container = scene.add.container(
            scene.scale.width / 2,
            scene.scale.height / 2
        );
        container.add(mapList);

        for (let i = 0; i < max_players; i++) {
            const _player = players[i];

            let slotBox: Phaser.GameObjects.Image;
            let slotName: Phaser.GameObjects.Text | null = null;

            if (_player) {
                // Player exists, show player slot with skin
                slotBox = new Phaser.GameObjects.Image(
                    scene,
                    0, // Position relative to the container
                    0,
                    asset_player + _player.skin
                );

                // Player's name displayed below the slot
                slotName = new Phaser.GameObjects.Text(
                    scene,
                    0, // Centered relative to the container
                    slotBox.height / 2 + 30, // Position text below the slotBox
                    _player.skin,
                    style
                );
                slotName.setOrigin(0.5);
            } else {
                // No player, show empty slot
                slotBox = new Phaser.GameObjects.Image(
                    scene,
                    0, // Position relative to the container
                    0,
                    asset_empty
                );
            }

            // Add the slotBox (and optionally the slotName) to the container
            container.add(slotBox);
            if (slotName) {
                container.add(slotName);
            }
        }
    }

    update() {}

    destroy() {
        this.clear(true); // Clear all elements in the group
    }
}

export class SpoilNotification extends Phaser.GameObjects.Group {
    private tween: Phaser.Tweens.Tween;

    constructor({ scene, asset, x, y }: SpoilNotificationConstructorParams) {
        super(scene);

        const picture = new Phaser.GameObjects.Image(scene, x, y - 20, asset);
        picture.setOrigin(0.5);
        this.add(picture);

        this.tween = scene.tweens.add({
            targets: picture,
            y: picture.y - 25,
            alpha: 0,
            duration: 600,
            onComplete: () => this.finish(),
        });
    }

    finish() {
        this.clear(true);
    }
}

