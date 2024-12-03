import { create } from "zustand";
import { GameStore } from "@utils/types";

export const useGameStore = create<GameStore>((set, get) => ({
    gameName: "",
    changeGameName: (name: string) => set(() => ({ gameName: name })),
    // removeItem: (id: number) =>
    //     set((state) => ({
    //         items: state.items.filter((item) => item.id !== id),
    //     })),
    // totalPrice: () =>
    //     get().items.reduce((total, item) => total + item.price, 0),
}));

export default useGameStore;

