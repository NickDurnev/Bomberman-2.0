import { GameStore } from "@utils/types";
import { create } from "zustand";

export const useGameStore = create<GameStore>((set) => ({
    gameName: "",
    changeGameName: (name: string) => set(() => ({ gameName: name })),
}));

export default useGameStore;

