import Phaser from "phaser";
import { PARTICLE_KEY } from "@/game/effects";
import {
  DEFAULT_TEXTURE_PACK_ID,
  getTexturePack,
  TEXTURE_SOURCES_KEY,
  type TexturePack,
} from "@/utils/texturePacks";
import { GameData, Player } from "@/utils/types";

// One sprite sheet and one blast animation per BlastedCell.type
const BLAST_TYPES = [
  "explosion_center",
  "explosion_horizontal",
  "explosion_vertical",
  "explosion_up",
  "explosion_right",
  "explosion_down",
  "explosion_left",
];

// Every texture a texture pack provides, under the keys the entities use.
// All but the map tileset are 35 x 35 sprite sheets.
const PACK_TEXTURES: { key: string; file: string; sheet: boolean }[] = [
  { key: "tiles", file: "tileset.png", sheet: false },
  ...BLAST_TYPES.map(type => ({ key: type, file: `${type}.png`, sheet: true })),
  { key: "spoil_tileset", file: "spoil_tileset.png", sheet: true },
  { key: "tombstone", file: "tombstone.png", sheet: true },
  { key: "bomb_tileset", file: "bombs.png", sheet: true },
  { key: "portal_tileset", file: "portal.png", sheet: true },
];

// Animations hold the frames of the textures they were made from, so every
// Preload run rebuilds them with the pack textures.
const PACK_ANIMATIONS = [
  "bomb",
  "portal",
  ...BLAST_TYPES.map(type => `blast_${type}`),
];

class Preload extends Phaser.Scene {
  private currentGame: GameData;
  private pack: TexturePack;
  // Keys that the room's pack lacks, loaded from the default pack
  private fallbackKeys = new Set<string>();

  constructor() {
    super("Preload");
  }

  init(game: GameData) {
    if (!game) {
      console.error("No game data provided to Preload scene");
      return;
    }

    this.currentGame = game;
    // Draw a simple progress bar outline
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const barWidth = Math.min(468, this.scale.width - 40);
    const progressBarOutline = this.add.rectangle(
      centerX,
      centerY,
      barWidth,
      32,
    );
    progressBarOutline.setStrokeStyle(2, 0xffffff);

    // Create the loading bar that fills as assets are loaded
    const progressBar = this.add.rectangle(
      centerX - (barWidth - 8) / 2,
      centerY,
      4,
      28,
      0xffffff,
    );

    // Load player skins directly, with proper checks. An empty skin is a
    // player without a photo: setPlayerAvatar gives it a random avatar.
    if (game.players && Array.isArray(game.players)) {
      game.players.forEach((player: Player) => {
        if (!player?.id) {
          console.warn("Invalid player data:", player);
        } else if (player.skin) {
          this.load.image(player.id, player.skin);
        }
      });
    } else {
      console.warn("No valid players array in game data");
    }

    // Update the progress bar width based on the load progress
    this.load.on("progress", (progress: number) => {
      progressBar.width = 4 + (barWidth - 8) * progress;
    });

    // Add error handling for load failures
    this.load.on("loaderror", (file: Phaser.Loader.File) => {
      console.error("Failed to load asset:", file.key);
    });

    this.load.start();
  }

  preload() {
    // Set the base path for loading assets
    this.load.baseURL = "/";

    // Textures of the room's texture pack, the same for every player
    this.pack = getTexturePack(this.currentGame.texturePack);
    this.clearPackTextures();
    this.loadPackTextures(this.pack, PACK_TEXTURES);

    // Load map assets
    this.load.tilemapTiledJSON("default_map", "assets/maps/default_map.json");
    this.load.tilemapTiledJSON("small_map", "assets/maps/small_map.json");
    this.load.tilemapTiledJSON("big_map", "assets/maps/big_map.json");

    //Default avatars
    this.load.image("avatar-1", "assets/images/avatars/avatar-1.png");
    this.load.image("avatar-2", "assets/images/avatars/avatar-2.png");
    this.load.image("avatar-3", "assets/images/avatars/avatar-3.png");
    this.load.image("avatar-4", "assets/images/avatars/avatar-4.png");
    this.load.image("avatar-5", "assets/images/avatars/avatar-5.png");
    this.load.image("avatar-6", "assets/images/avatars/avatar-6.png");
    this.load.image("avatar-7", "assets/images/avatars/avatar-7.png");
    this.load.image("avatar-8", "assets/images/avatars/avatar-8.png");
    this.load.image("avatar-9", "assets/images/avatars/avatar-9.png");
    this.load.image("avatar-10", "assets/images/avatars/avatar-10.png");
    this.load.image("avatar-11", "assets/images/avatars/avatar-11.png");
    this.load.image("avatar-12", "assets/images/avatars/avatar-12.png");
    this.load.image("avatar-13", "assets/images/avatars/avatar-13.png");
    this.load.image("avatar-14", "assets/images/avatars/avatar-14.png");
    this.load.image("avatar-15", "assets/images/avatars/avatar-15.png");
    this.load.image("avatar-16", "assets/images/avatars/avatar-16.png");
  }

  create() {
    // A pack file that is missing or does not decode (a 404 can come back as
    // index.html, which emits no loaderror) leaves its key empty: load that
    // key from the default pack in a second pass.
    const missing = PACK_TEXTURES.filter(
      ({ key }) => !this.textures.exists(key),
    );
    this.fallbackKeys = new Set();
    if (missing.length > 0 && this.pack.id !== DEFAULT_TEXTURE_PACK_ID) {
      this.fallbackKeys = new Set(missing.map(({ key }) => key));
      const keys = missing.map(({ key }) => key).join(", ");
      console.warn(
        `Texture pack "${this.pack.id}" lacks ${keys}: using default`,
      );
      this.loadPackTextures(getTexturePack(DEFAULT_TEXTURE_PACK_ID), missing);
      this.load.once(Phaser.Loader.Events.COMPLETE, () => this.startMatch());
      this.load.start();
      return;
    }
    this.startMatch();
  }

  private startMatch() {
    // The pack each texture came from (null: missing). The E2E hook reads it.
    const sources: Record<string, string | null> = {};
    for (const { key } of PACK_TEXTURES) {
      if (!this.textures.exists(key)) {
        console.error("Texture missing from the default pack:", key);
        sources[key] = null;
      } else {
        sources[key] = this.fallbackKeys.has(key)
          ? DEFAULT_TEXTURE_PACK_ID
          : this.pack.id;
      }
    }
    this.registry.set(TEXTURE_SOURCES_KEY, sources);
    this.createAnimations();
    this.createParticleTexture();
    this.scene.start("Playing", this.currentGame);
  }

  // Textures and animations live on the Phaser.Game, not the scene, and the
  // loader skips a key that exists. Drop an earlier run's pack textures so a
  // pack change between matches on the same game loads the new files.
  private clearPackTextures() {
    for (const { key } of PACK_TEXTURES) {
      if (this.textures.exists(key)) {
        this.textures.remove(key);
      }
    }
    for (const key of PACK_ANIMATIONS) {
      this.anims.remove(key);
    }
  }

  private loadPackTextures(pack: TexturePack, textures: typeof PACK_TEXTURES) {
    for (const { key, file, sheet } of textures) {
      // No leading slash: load.baseURL is already "/"
      const path = `${pack.basePath}/${file}`;
      if (sheet) {
        this.load.spritesheet(key, path, { frameWidth: 35, frameHeight: 35 });
      } else {
        this.load.image(key, path);
      }
    }
  }

  private createParticleTexture() {
    if (this.textures.exists(PARTICLE_KEY)) {
      return;
    }
    const graphics = this.make.graphics({}, false);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 4, 4);
    graphics.generateTexture(PARTICLE_KEY, 4, 4);
    graphics.destroy();
  }

  private createAnimations() {
    if (!this.anims.exists("bomb")) {
      this.anims.create({
        key: "bomb",
        frames: this.anims.generateFrameNumbers("bomb_tileset", {
          start: 0,
          end: 13,
        }),
        frameRate: 6,
        repeat: -1,
      });
    }

    if (!this.anims.exists("portal")) {
      this.anims.create({
        key: "portal",
        frames: this.anims.generateFrameNumbers("portal_tileset", {
          start: 0,
          end: 14,
        }),
        frameRate: 20,
        repeat: -1,
      });
    }

    // One blast animation per explosion sheet
    for (const type of BLAST_TYPES) {
      const key = `blast_${type}`;
      if (!this.anims.exists(key)) {
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(type, { start: 0, end: 4 }),
          frameRate: 20,
          repeat: 0, // No looping
          hideOnComplete: true,
        });
      }
    }
  }
}

export default Preload;
