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
    INITIAL_BOMBS,
    STEP_BOMBS,
    STEP_POWER,
    SPEED,
    POWER,
    DELAY,
    BOMBS,
    PORTAL_DELAY_STEP,
} from "@utils/constants";
import { setPlayerAvatar } from "@utils/utils";
import { ISpoilType, PlayerConfig, Coordinates } from "@utils/types";
import Playing from "@game/scenes/Playing";
import clientSocket from "@utils/socket";
import { Text } from "@helpers/elements";

export class Player extends Phaser.GameObjects.Sprite {
    readonly game: Playing;
    readonly id: string;
    readonly gameId: string;
    private prevPosition: { x: number; y: number };
    private delay: number;
    private power: number;
    private speed: number;
    private bombs: number;
    private activeBombs: number;
    private lastBombTime: number;
    private upKey: Phaser.Input.Keyboard.Key;
    private downKey: Phaser.Input.Keyboard.Key;
    private leftKey: Phaser.Input.Keyboard.Key;
    private rightKey: Phaser.Input.Keyboard.Key;
    private spaceKey: Phaser.Input.Keyboard.Key;
    readonly sprite: Phaser.GameObjects.Sprite;
    playerText: Text;
    lastTeleportTime: number = 0;
    maskShape: Phaser.GameObjects.Graphics;

    constructor({ game, id, spawn, skin, name }: PlayerConfig) {
        const centerCol = spawn.x - TILE_SIZE / 2;
        const centerRow = spawn.y - TILE_SIZE / 2;

        super(game, centerCol, centerRow, skin, name);

        this.game = game;
        this.id = id;
        this.gameId = game.getGameId();
        this.prevPosition = {
            x: centerCol,
            y: centerRow,
        };
        this.delay = INITIAL_DELAY;
        this.power = INITIAL_POWER;
        this.speed = INITIAL_SPEED;
        this.bombs = INITIAL_BOMBS;
        this.activeBombs = 0;
        this.lastBombTime = 0;

        this.game.add.existing(this);
        this.game.physics.add.existing(this);
        this.setDepth(10);

        this.game.time.addEvent({
            delay: PING,
            callback: this.positionUpdaterLoop,
            callbackScope: this,
            loop: true,
        });

        setPlayerAvatar(this, id);

        //DEBUG
        // this.game.physics.world.createDebugGraphic();
        // this.getBody().debugBodyColor = 0xff0000;

        this.defineText(name);
        this.defineKeyboard();
    }

    update() {
        if (this.active) {
            this.handleMoves();
            this.handleBombs();

            // Update the text position
            if (this.playerText) {
                this.playerText.setPosition(
                    this.x - this.playerText.width / 2,
                    this.y - TILE_SIZE * 1.2,
                );
            }

            if (this.maskShape) {
                this.maskShape.setPosition(this.x, this.y);
            }
        }
    }

    getBody(): Physics.Arcade.Body {
        return this.body as Physics.Arcade.Body;
    }

    private defineKeyboard() {
        this.upKey = this.game.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.UP,
        );
        this.downKey = this.game.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.DOWN,
        );
        this.leftKey = this.game.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.LEFT,
        );
        this.rightKey = this.game.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.RIGHT,
        );
        this.spaceKey = this.game.input.keyboard!.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE,
        );
    }

    private defineText(name: string) {
        const style = {
            font: "14px Arial",
            fill: "#493D9E",
            stroke: "#000000",
            strokeThickness: 3,
        } as Phaser.Types.GameObjects.Text.TextStyle;

        this.playerText = this.game.add.text(
            this.x,
            this.y - TILE_SIZE * 1.2,
            name,
            style,
        );

        this.playerText.setX(this.x - this.playerText.width / 2);
        this.playerText.setDepth(10);
    }

    handleMoves() {
        this.getBody().setVelocity(0);
        const velocity = this.speed;

        const now = this.game.time.now;

        if (now - this.lastTeleportTime < PORTAL_DELAY_STEP) {
            return;
        }

        if (this.upKey?.isDown) {
            this.body!.velocity.y = -velocity;
        }
        if (this.leftKey?.isDown) {
            this.body!.velocity.x = -velocity;
        }
        if (this.downKey?.isDown) {
            this.body!.velocity.y = velocity;
        }
        if (this.rightKey?.isDown) {
            this.body!.velocity.x = velocity;
        }
    }

    handleBombs() {
        if (this.spaceKey.isDown) {
            if (this.activeBombs >= this.bombs) {
                return;
            }
            const now = this.game.time.now;

            if (now > this.lastBombTime) {
                const delay =
                    100 + ((MAX_SPEED - this.speed) / STEP_SPEED) * 10;
                this.lastBombTime = now + delay;

                clientSocket.emit("create bomb", {
                    playerId: this.id,
                    gameId: this.gameId,
                    col: this.currentCol(),
                    row: this.currentRow(),
                });
            }
        }
    }

    currentCol() {
        return Math.floor(this.x / TILE_SIZE);
    }

    currentRow() {
        return Math.floor(this.y / TILE_SIZE);
    }

    positionUpdaterLoop() {
        const newPosition = { x: this.x, y: this.y };

        if (
            this.prevPosition.x !== newPosition.x ||
            this.prevPosition.y !== newPosition.y
        ) {
            clientSocket.emit("update player position", {
                playerId: this.id,
                gameId: this.gameId,
                ...newPosition,
            });
            this.prevPosition = newPosition;
        }
    }

    becomesDead() {
        this.setActive(false);
        this.setVisible(false);
    }

    pickSpoil(spoilType: ISpoilType) {
        if (spoilType === SPEED) {
            this.increaseSpeed();
        } else if (spoilType === POWER) {
            this.increasePower();
        } else if (spoilType === DELAY) {
            this.decreaseDelay();
        } else if (spoilType === BOMBS) {
            this.increaseBombs();
        }
    }

    goTo(newPosition: Coordinates) {
        this.prevPosition = {
            x: newPosition.x,
            y: newPosition.y,
        };

        this.game.add.tween({
            targets: this,
            x: newPosition.x,
            y: newPosition.y,
            duration: PING,
            ease: Phaser.Math.Easing.Linear,
        });

        if (this.playerText) {
            this.game.add.tween({
                targets: this.playerText,
                x: newPosition.x - this.playerText.width / 2,
                y: newPosition.y - TILE_SIZE * 1.2,
                duration: PING,
                ease: Phaser.Math.Easing.Linear,
            });
        }

        // Update mask position
        if (this.maskShape) {
            this.game.add.tween({
                targets: this.maskShape,
                x: newPosition.x,
                y: newPosition.y,
                duration: PING,
                ease: Phaser.Math.Easing.Linear,
            });
        }
    }

    decreaseActiveBombs() {
        this.activeBombs--;
    }

    increaseActiveBombs() {
        this.activeBombs++;
    }

    increaseSpeed() {
        if (this.speed < MAX_SPEED) {
            this.speed += STEP_SPEED;
        }
    }

    decreaseDelay() {
        if (this.delay > MIN_DELAY) {
            this.delay -= STEP_DELAY;
        }
    }

    increasePower() {
        this.power += STEP_POWER;
    }

    increaseBombs() {
        this.bombs += STEP_BOMBS;
    }

    resetProperties() {
        this.delay = INITIAL_DELAY;
        this.power = INITIAL_POWER;
        this.speed = INITIAL_SPEED;
        this.bombs = INITIAL_BOMBS;
        this.activeBombs = 0;
        this.lastBombTime = 0;
    }

    removeKeyboard() {
        this.game.input.keyboard?.removeKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.game.input.keyboard?.removeKey(
            Phaser.Input.Keyboard.KeyCodes.DOWN,
        );
        this.game.input.keyboard?.removeKey(
            Phaser.Input.Keyboard.KeyCodes.LEFT,
        );
        this.game.input.keyboard?.removeKey(
            Phaser.Input.Keyboard.KeyCodes.RIGHT,
        );
        this.game.input.keyboard?.removeKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE,
        );
    }
}
