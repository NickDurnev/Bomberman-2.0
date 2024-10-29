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
        upFrame,
        overFrame,
        outFrame,
        downFrame,
    }: ButtonConstructorParams) {
        super(scene, x, y, asset);

        this.setInteractive({ useHandCursor: true })
            .on("pointerover", () => this.setFrame(overFrame))
            .on("pointerout", () => this.setFrame(outFrame))
            .on("pointerdown", () => this.setFrame(downFrame))
            .on("pointerup", () => {
                this.setFrame(upFrame);
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
        overFrame,
        outFrame,
        downFrame,
        upFrame,
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
            overFrame,
            outFrame,
            downFrame,
            upFrame,
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
        availableGames,
        callback,
        callbackContext,
        x,
        y,
        style,
    }: GameSlotsConstructorParams) {
        super(scene);

        const gameSlotAsset = "slot_backdrop";
        const gameEnterAsset = "list_icon";

        let yOffset = y;

        availableGames.forEach((availableGame) => {
            // Create a container for the game slot
            const gameBoxContainer = new Phaser.GameObjects.Container(
                scene,
                x,
                yOffset
            );

            // Create the background image for the slot
            const gameBoxImage = new Phaser.GameObjects.Image(
                scene,
                0, // Position relative to the container
                0,
                gameSlotAsset
            );

            // Create the button sprite
            const button = new Phaser.GameObjects.Sprite(
                scene,
                gameBoxImage.width / 2 - 100, // Adjust position relative to the image
                12,
                gameEnterAsset
            )
                .setInteractive()
                .on("pointerup", () =>
                    callback.call(callbackContext, {
                        game_id: availableGame.id,
                    })
                );

            // Create the text for the game slot
            const text = new Phaser.GameObjects.Text(
                scene,
                -gameBoxImage.width / 2 + 30, // Adjust position relative to the image
                25,
                `Join Game: ${availableGame.name}`,
                style
            );

            // Add image, button, and text to the container
            gameBoxContainer.add([gameBoxImage, button, text]);

            // Add the container to the group
            this.add(gameBoxContainer);

            // Increment yOffset for the next game slot
            yOffset += 105;
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
        x,
        y,
        asset_empty,
        asset_player,
        style,
    }: PlayerSlotsConstructorParams) {
        super(scene);

        let xOffset = x;

        for (let i = 0; i < max_players; i++) {
            const _player = players[i];

            // Create a container to hold the slot box and name
            const slotContainer = new Phaser.GameObjects.Container(
                scene,
                xOffset,
                y
            );

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
            slotContainer.add(slotBox);
            if (slotName) {
                slotContainer.add(slotName);
            }

            // Add the container to the group
            this.add(slotContainer);

            // Move xOffset for the next slot
            xOffset += 170;
        }
    }

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

