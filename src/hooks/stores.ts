import { create } from "zustand";
import { GameStore } from "@utils/types";

export const useGameStore = create<GameStore>((set, get) => ({
    gameName: "",
    changeGameName: (name: string) => set(() => ({ gameName: name })),
}));

export default useGameStore;

