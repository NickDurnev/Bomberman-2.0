import Phaser from "phaser";
import { TILE_SIZE } from "../../utils/constants";

export default class Bone extends Phaser.GameObjects.Sprite {
    constructor(game: Phaser.Scene, col: number, row: number) {
        super(game, col * TILE_SIZE, row * TILE_SIZE, "bone_tileset");
    }
}

