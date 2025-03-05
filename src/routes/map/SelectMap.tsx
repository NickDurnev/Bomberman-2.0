import React from "react";
import { useNavigate } from "react-router-dom";

import clientSocket from "@utils/socket";
import { GameStore, MapCard, MapData } from "@utils/types";
import { useGameStore } from "@hooks/stores";
import { AVAILABLE_MAPS } from "@utils/constants";
import { Carousel, Card, UserBar } from "@components/index";

import MapForm from "./components/mapForm";
import default_map_data from "public/assets/maps/default_map.json";
import small_map_data from "public/assets/maps/small_map.json";

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
        console.log(" MapData:", data);
        clientSocket.emit("create game", { ...data, gameName }, joinToNewGame);
    };

    const joinToNewGame = ({ game_id }: { game_id: string }) => {
        navigate("/pending/" + game_id);
    };

    const ModalContent = (
        card: MapCard,
        mapName: string,
        onSelect: (data: MapData) => void
    ) => {
        return (
            <div className="py-10">
                <div className="flex flex-col gap-y-5 items-start justify-start bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 text-left rounded-3xl mb-4">
                    <p className="text-neutral-700 dark:text-neutral-200 text-base md:text-2xl font-bold max-w-3xl">
                        Players: 1 - {card.maxPlayers}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl">
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
            <div className="w-full h-full py-4">
                <h2 className="max-w-7xl pl-14 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
                    Select map
                </h2>
                <Carousel items={cards} />
            </div>
        </>
    );
};

export default SelectMap;

