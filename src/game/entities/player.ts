import {
    PING,
    TILE_SIZE,
    MAX_SPEED,
    STEP_SPEED,
    INITIAL_SPEED,
    MIN_DELAY,
    STEP_DELAY,
    INITIAL_DELAY,
    INITIAL_POWER,
    STEP_POWER,
    SPEED,
    POWER,
    DELAY,
} from "../../utils/constants";
import { ISpoilType, PlayerConfig } from "../../utils/types";

import Info from "./info";
import { SpoilNotification, Text } from "../../helpers/elements";

export default class Player extends Phaser.GameObjects.Container {
    game: Phaser.Scene;
    id: number;
    prevPosition: { x: number; y: number };
    delay: number;
    power: number;
    speed: number;
    private _lastBombTime: number;
    info: Info;
    upKey: Phaser.Input.Keyboard.Key;
    downKey: Phaser.Input.Keyboard.Key;
    leftKey: Phaser.Input.Keyboard.Key;
    rightKey: Phaser.Input.Keyboard.Key;
    spaceKey: Phaser.Input.Keyboard.Key;
    sprite: Phaser.GameObjects.Sprite;

    constructor({ scene, id, spawn, skin }: PlayerConfig) {
        super(scene, spawn.x, spawn.y);

        this.game = scene;
        this.id = id;
        this.prevPosition = { x: spawn.x, y: spawn.y };
        this.delay = INITIAL_DELAY;
        this.power = INITIAL_POWER;
        this.speed = INITIAL_SPEED;
        this._lastBombTime = 0;

        // Create the player sprite and add to the container
        this.sprite = new Phaser.GameObjects.Sprite(
            scene,
            0,
            0,
            `bomberman_${skin}`
        );
        this.add(this.sprite);

        this.game.add.existing(this);
        this.game.physics.add.existing(this);

        // Update setSize with valid arguments
        (this.body as Phaser.Physics.Arcade.Body).setSize(20, 20);

        this.game.time.addEvent({
            delay: PING,
            callback: this.positionUpdaterLoop,
            callbackScope: this,
            loop: true,
        });

        this.sprite.anims.create({
            key: "up",
            frames: this.sprite.anims.generateFrameNumbers(
                `bomberman_${skin}`,
                {
                    start: 9,
                    end: 11,
                }
            ),
            frameRate: 15,
            repeat: -1,
        });

        this.sprite.anims.create({
            key: "down",
            frames: this.sprite.anims.generateFrameNumbers(
                `bomberman_${skin}`,
                {
                    start: 0,
                    end: 2,
                }
            ),
            frameRate: 15,
            repeat: -1,
        });

        this.sprite.anims.create({
            key: "right",
            frames: this.sprite.anims.generateFrameNumbers(
                `bomberman_${skin}`,
                {
                    start: 6,
                    end: 8,
                }
            ),
            frameRate: 15,
            repeat: -1,
        });

        this.sprite.anims.create({
            key: "left",
            frames: this.sprite.anims.generateFrameNumbers(
                `bomberman_${skin}`,
                {
                    start: 3,
                    end: 5,
                }
            ),
            frameRate: 15,
            repeat: -1,
        });

        this.info = new Info({ game: this.game, player: this });

        this.defineKeyboard();
        this.defineSelf(skin);
    }

    update() {
        if (this.active) {
            this.handleMoves();
            this.handleBombs();
        }
    }

    defineKeyboard() {
        this.upKey = this.game.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.UP
        );
        this.downKey = this.game.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.DOWN
        );
        this.leftKey = this.game.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.LEFT
        );
        this.rightKey = this.game.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.RIGHT
        );
        this.spaceKey = this.game.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
    }

    handleMoves() {
        (this.body as Phaser.Physics.Arcade.Body).setVelocity(0);
        const animationsArray: string[] = [];

        if (this.leftKey.isDown) {
            (this.body as Phaser.Physics.Arcade.Body).velocity.x = -this.speed;
            animationsArray.push("left");
        } else if (this.rightKey.isDown) {
            (this.body as Phaser.Physics.Arcade.Body).velocity.x = this.speed;
            animationsArray.push("right");
        }

        if (this.upKey.isDown) {
            (this.body as Phaser.Physics.Arcade.Body).velocity.y = -this.speed;
            animationsArray.push("up");
        } else if (this.downKey.isDown) {
            (this.body as Phaser.Physics.Arcade.Body).velocity.y = this.speed;
            animationsArray.push("down");
        }

        const currentAnimation = animationsArray[0];
        if (currentAnimation) {
            this.sprite.anims.play(currentAnimation, true);
            return;
        }

        this.sprite.anims.stop();
    }

    handleBombs() {
        if (this.spaceKey.isDown) {
            const now = this.game.time.now;

            if (now > this._lastBombTime) {
                this._lastBombTime = now + this.delay;

                // clientSocket.emit("create bomb", {
                //     col: this.currentCol(),
                //     row: this.currentRow(),
                // });
            }
        }
    }

    currentCol() {
        return Math.floor(this.body!.position.x / TILE_SIZE);
    }

    currentRow() {
        return Math.floor(this.body!.position.y / TILE_SIZE);
    }

    positionUpdaterLoop() {
        const newPosition = { x: this.x, y: this.y };

        if (
            this.prevPosition.x !== newPosition.x ||
            this.prevPosition.y !== newPosition.y
        ) {
            // clientSocket.emit("update player position", newPosition);
            this.prevPosition = newPosition;
        }
    }

    becomesDead() {
        this.info.showDeadInfo();
        this.setActive(false);
        this.setVisible(false);
    }

    pickSpoil(spoilType: ISpoilType) {
        if (spoilType === SPEED) {
            this.increaseSpeed();
        } else if (spoilType === POWER) {
            this.increasePower();
        } else if (spoilType === DELAY) {
            this.increaseDelay();
        }
    }

    increaseSpeed() {
        let asset = "speed_up_no_bonus";

        if (this.speed < MAX_SPEED) {
            this.speed += STEP_SPEED;
            this.info.refreshStatistic();
            asset = "speed_up_bonus";
        }

        new SpoilNotification({
            scene: this.game,
            asset: asset,
            x: this.x,
            y: this.y,
        });
    }

    increaseDelay() {
        let asset = "delay_up_no_bonus";

        if (this.delay > MIN_DELAY) {
            this.delay -= STEP_DELAY;
            this.info.refreshStatistic();
            asset = "delay_up_bonus";
        }

        new SpoilNotification({
            scene: this.game,
            asset: asset,
            x: this.x,
            y: this.y,
        });
    }

    increasePower() {
        this.power += STEP_POWER;
        this.info.refreshStatistic();

        new SpoilNotification({
            scene: this.game,
            asset: "power_up_bonus",
            x: this.x,
            y: this.y,
        });
    }

    defineSelf(name: string) {
        const playerText = new Text({
            scene: this.game,
            x: TILE_SIZE / 2,
            y: -10,
            text: `\u272E ${name} \u272E`,
            style: {
                font: "15px Arial",
                color: "#FFFFFF",
                // fill: "#FFFFFF",
                stroke: "#000000",
                strokeThickness: 3,
            },
        });

        this.add(playerText);
    }
}

