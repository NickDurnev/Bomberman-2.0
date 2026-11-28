import type Phaser from "phaser";
import clientSocket from "@/utils/socket";
import { TEXTURE_SOURCES_KEY } from "@/utils/texturePacks";

// Read-only test hook for the E2E suite (Bomberman-2.0-E2E). main.tsx installs
// it only when VITE_E2E is "true", so other builds drop this module.
// The interface is documented in the workspace docs/e2e-hook.md.

// Every event the client registers on clientSocket.
export const E2E_SOCKET_EVENTS = [
  "connect",
  "connect_error",
  "disconnect",
  "display pending games",
  "update game",
  "start timer",
  "launch game",
  "end game",
  "player win",
  "state",
  "teleport player",
  "show bomb",
  "detonate bomb",
  "spoil was picked",
  "show tombstone",
  "player disconnect",
] as const;

interface E2EPlayer {
  name: string;
  x: number;
  y: number;
}

interface E2EState {
  me: (E2EPlayer & { alive: boolean }) | null;
  enemies: E2EPlayer[];
  bombs: number;
}

export interface E2EHook {
  listenerCounts(events?: string[]): Record<string, number>;
  scenes(): string[];
  state(): E2EState | null;
  textures(): Record<string, string | null>;
}

type NamedSprite = Phaser.GameObjects.Sprite & {
  playerText?: { text: string };
};

// The private fields of the Playing scene that the hook reads.
interface PlayingView {
  player?: NamedSprite;
  enemies?: Phaser.GameObjects.Group;
  bombs?: Phaser.GameObjects.Group;
}

let currentGame: Phaser.Game | null = null;

export function setCurrentGame(game: Phaser.Game | null): void {
  currentGame = game;
}

const toPlayer = (sprite: NamedSprite): E2EPlayer => ({
  name: sprite.playerText?.text ?? "",
  x: sprite.x,
  y: sprite.y,
});

const hook: E2EHook = {
  listenerCounts(events = [...E2E_SOCKET_EVENTS]) {
    return Object.fromEntries(
      events.map(event => [event, clientSocket.listeners(event).length]),
    );
  },

  scenes() {
    return (
      currentGame?.scene.getScenes(true).map(scene => scene.scene.key) ?? []
    );
  },

  state() {
    const scene = currentGame?.scene.getScene("Playing");
    if (!scene?.scene.isActive()) {
      return null;
    }
    const view = scene as unknown as PlayingView;
    const enemies = (view.enemies?.getChildren() ?? []) as NamedSprite[];
    return {
      me: view.player
        ? { ...toPlayer(view.player), alive: view.player.active }
        : null,
      enemies: enemies.map(toPlayer),
      bombs: view.bombs?.countActive() ?? 0,
    };
  },

  textures() {
    const sources = currentGame?.registry.get(TEXTURE_SOURCES_KEY) as
      | Record<string, string | null>
      | undefined;
    return { ...sources };
  },
};

export function installE2EHook(): void {
  (window as Window & { __e2e?: E2EHook }).__e2e = hook;
}
