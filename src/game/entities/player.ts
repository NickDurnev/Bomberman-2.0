import { Physics } from "phaser";
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
} from "@utils/constants";
import { ISpoilType, PlayerConfig } from "@utils/types";
import clientSocket from "@utils/socket";
import Info from "./info";
import { SpoilNotification } from "@helpers/elements";

export default class Player extends Physics.Arcade.Image {
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
        super(scene, spawn.x, spawn.y, skin);

        this.game = scene;
        this.id = id;
        this.prevPosition = { x: spawn.x, y: spawn.y };
        this.delay = INITIAL_DELAY;
        this.power = INITIAL_POWER;
        this.speed = INITIAL_SPEED;
        this._lastBombTime = 0;

        this.game.add.existing(this);
        this.game.physics.add.existing(this);

        this.game.time.addEvent({
            delay: PING,
            callback: this.positionUpdaterLoop,
            callbackScope: this,
            loop: true,
        });

        this.info = new Info({ game: this.game, player: this });

        this.setTexture(`${id}`);
        this.setDisplaySize(TILE_SIZE, TILE_SIZE);
        this.getBody().setSize(95, 95);
        this.getBody().setOffset(0, 0);
        //DEBUG
        this.game.physics.world.createDebugGraphic();
        this.getBody().debugBodyColor = 0xff0000;
        // this.setCircle(
        //     this.getBody().halfWidth,
        //     0,
        //     this.getBody().halfHeight - this.getBody().halfWidth
        // );

        this.defineKeyboard();
    }

    update() {
        if (this.active) {
            this.handleMoves();
            this.handleBombs();
        }
    }

    protected getBody(): Physics.Arcade.Body {
        return this.body as Physics.Arcade.Body;
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
        this.getBody().setVelocity(0);
        if (this.upKey?.isDown) {
            this.body!.velocity.y = -110;
        }
        if (this.leftKey?.isDown) {
            this.body!.velocity.x = -110;
        }
        if (this.downKey?.isDown) {
            this.body!.velocity.y = 110;
        }
        if (this.rightKey?.isDown) {
            this.body!.velocity.x = 110;
        }
    }

    handleBombs() {
        if (this.spaceKey.isDown) {
            const now = this.game.time.now;

            if (now > this._lastBombTime) {
                this._lastBombTime = now + this.delay;

                clientSocket.emit("create bomb", {
                    col: this.currentCol(),
                    row: this.currentRow(),
                });
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
            clientSocket.emit("update player position", newPosition);
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
}

