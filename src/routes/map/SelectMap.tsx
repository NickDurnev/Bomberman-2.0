import React from "react";
import { useNavigate } from "react-router-dom";

import { Card, Carousel, UserBar } from "@components/index";
import { useGameStore } from "@hooks/stores";
import { AVAILABLE_MAPS } from "@utils/constants";
import clientSocket from "@utils/socket";
import { GameStore, MapCard, MapData } from "@utils/types";

import default_map_data from "public/assets/maps/default_map.json";
import small_map_data from "public/assets/maps/small_map.json";
import MapForm from "./components/mapForm";

const data = [
    {
        title: "Default map",
        src: "./assets/images/menu/default_map_preview.png",
        maxPlayers: default_map_data.layers[0].properties.max_players,
        description:
            "A balanced battlefield with walls and destructible boxes. Collect power-ups like speed boosts, extra bombs, and fire blasts to gain the upper hand. Strategize your moves and outlast your opponents in explosive combat!",
    },
    {
        title: "Small map",
        src: "./assets/images/menu/small_map_preview.png",
        maxPlayers: small_map_data.layers[0].properties.max_players,
        description:
            "A compact and intense arena where every move counts. With limited space, action is fast-paced, and bombs explode closer than ever. Use power-ups wisely and dominate your rivals before they get you first!",
    },
];

const SelectMap: React.FC = () => {
    const navigate = useNavigate();
    const gameName = useGameStore((state: GameStore) => state.gameName);

    const confirmStageSelection = (data: MapData) => {
        clientSocket.emit("create game", { ...data, gameName }, joinToNewGame);
    };

    const joinToNewGame = ({ game_id }: { game_id: string }) => {
        navigate(`/pending/${game_id}`);
    };

    const ModalContent = (
        card: MapCard,
        mapName: string,
        onSelect: (data: MapData) => void,
    ) => {
        return (
            <div className="overflow-hidden py-10">
                <div className="mb-4 flex flex-col items-start justify-start gap-y-5 rounded-3xl bg-[#F5F5F7] p-8 text-left md:p-14 dark:bg-neutral-800">
                    <p className="max-w-3xl font-bold text-base text-neutral-700 md:text-2xl dark:text-neutral-200">
                        Players: 1 - {card.maxPlayers}
                    </p>
                    <p className="max-w-3xl font-sans text-base text-neutral-600 md:text-2xl dark:text-neutral-400">
                        {card.description}
                    </p>
                    <MapForm mapName={mapName} onSelect={onSelect} />
                </div>
            </div>
        );
    };

    const cards = data.map((card, index) => (
        <Card
            key={card.src ?? index}
            card={card}
            index={index}
            mapName={AVAILABLE_MAPS[index]}
            modalContent={ModalContent}
            onSelect={confirmStageSelection}
        />
    ));

    return (
        <>
            <UserBar />
            <div className="h-full w-full overflow-x-hidden py-4">
                <h2 className="mx-auto max-w-7xl pl-14 font-bold font-sans text-neutral-800 text-xl md:text-5xl dark:text-neutral-200">
                    Select map
                </h2>
                <Carousel items={cards} />
            </div>
        </>
    );
};

export default SelectMap;

