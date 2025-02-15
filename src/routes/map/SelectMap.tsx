import React from "react";
import { useNavigate } from "react-router-dom";

import clientSocket from "@utils/socket";
import { GameStore } from "@utils/types";
import { useGameStore } from "@hooks/stores";
import { AVAILABLE_MAPS } from "@utils/constants";
import { Carousel, Card, UserBar } from "@components/index";

import default_map_data from "public/assets/maps/default_map.json";
import small_map_data from "public/assets/maps/small_map.json";

console.log("default_data:", default_map_data);

const data = [
    {
        title: "Default map",
        src: "./assets/images/menu/default_map_preview.png",
        maxPlayers: default_map_data.layers[0].properties.max_players,
    },
    {
        title: "Small map",
        src: "./assets/images/menu/small_map_preview.png",
        maxPlayers: small_map_data.layers[0].properties.max_players,
    },
    {
        title: "In progress",
    },
];

const SelectMap: React.FC = () => {
    const navigate = useNavigate();
    const gameName = useGameStore((state: GameStore) => state.gameName);

    const confirmStageSelection = (mapName: string) => {
        clientSocket.emit("create game", { mapName, gameName }, joinToNewGame);
    };

    const joinToNewGame = ({ game_id }: { game_id: string }) => {
        navigate("/pending/" + game_id);
    };

    const cards = data.map((card, index) => (
        <Card
            key={card.src ?? index}
            card={card}
            index={index}
            maxPlayers={card.maxPlayers}
            mapName={AVAILABLE_MAPS[index]}
            disabled={!card.src}
            onSelect={(mapName) => confirmStageSelection(mapName)}
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

