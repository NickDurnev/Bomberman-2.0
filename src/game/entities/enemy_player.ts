import { Physics } from "phaser";
import { TILE_SIZE, PING } from "@utils/constants";
import { Spawn, PlayerConfig } from "@utils/types";
import { Text } from "@helpers/elements";
import Playing from "@game/scenes/Playing";

export default class EnemyPlayer extends Phaser.GameObjects.Sprite {
    readonly game: Playing;
    readonly id: number;
    readonly gameId: string;
    currentPosition: Spawn;
    playerText: Text;
    lastMoveAt: number;

    constructor({ game, id, spawn, skin, name }: PlayerConfig) {
        const centerCol = spawn.x - TILE_SIZE / 2;
        const centerRow = spawn.y - TILE_SIZE / 2;

        super(game, centerCol, centerRow, skin, name);

        this.game = game;
        this.id = id;
        this.gameId = game.getGameId();
        this.currentPosition = spawn;
        this.lastMoveAt = 0;

        // Enable physics on this object
        this.game.add.existing(this);
        this.game.physics.add.existing(this);

        if (this.game.textures.exists(`${id}`)) {
            this.setTexture(`${id}`);
            this.setDisplaySize(TILE_SIZE - 7, TILE_SIZE - 7);
            this.getBody().setSize((TILE_SIZE - 7) * 4, (TILE_SIZE - 7) * 4);
        } else {
            const randomNumber = Math.floor(Math.random() * 12) + 1;
            this.setTexture(`avatar-${randomNumber}`);
            this.setDisplaySize(TILE_SIZE - 3, TILE_SIZE - 3);
            this.getBody().setSize((TILE_SIZE - 3) * 4, (TILE_SIZE - 3) * 4);
        }

        this.getBody().setImmovable(true);

        //DEBUG
        this.game.physics.world.createDebugGraphic();
        this.getBody().debugBodyColor = 0xff0000;

        this.defineText(name);
    }

    protected getBody(): Physics.Arcade.Body {
        return this.body as Physics.Arcade.Body;
    }

    goTo(newPosition: Spawn) {
        this.lastMoveAt = this.game.time.now;
        this.currentPosition = newPosition;

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
    }

    private defineText(name: string) {
        const style = {
            font: "14px Arial",
            fill: "#FFFFFF",
            stroke: "#000000",
            strokeThickness: 3,
        } as Phaser.Types.GameObjects.Text.TextStyle;

        this.playerText = this.game.add.text(
            this.x,
            this.y - TILE_SIZE * 1.2,
            name,
            style
        );

        this.playerText.setX(this.x - this.playerText.width / 2);
        this.playerText.setDepth(10);
    }
}

