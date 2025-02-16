import React from "react";
import { useNavigate } from "react-router-dom";

import clientSocket from "@utils/socket";
import { GameStore } from "@utils/types";
import { useGameStore } from "@hooks/stores";
import { AVAILABLE_MAPS } from "@utils/constants";
import { Carousel, Card, UserBar } from "@components/index";

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
            mapName={AVAILABLE_MAPS[index]}
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

