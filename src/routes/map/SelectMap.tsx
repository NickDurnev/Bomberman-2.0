import React from "react";
import { useNavigate } from "react-router-dom";

import clientSocket from "@utils/socket";
import { GameStore } from "@utils/types";
import { useGameStore } from "@hooks/stores";
import { AVAILABLE_MAPS } from "@utils/constants";
import { Carousel, Card } from "@components/index";

// interface MapButtonProps {
//     mapName: string;
//     onSelect: (mapName: string) => void;
// }

const data = [
    {
        title: "Default map",
        // src: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
        title: "Enhance your productivity.",
        src: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
        title: "Launching the new Apple Vision Pro.",
        src: "https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80&w=2333&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
];

// const MapButton: React.FC<MapButtonProps> = ({ mapName, onSelect }) => (
//     <button
//         onClick={() => onSelect(mapName)}
//         style={{
//             backgroundImage: `url(/assets/images/menu/${mapName}_preview.png)`,
//             backgroundSize: "cover",
//             width: "300px",
//             height: "100px",
//             border: "none",
//             marginBottom: "20px",
//             cursor: "pointer",
//         }}
//     >
//         {mapName}
//     </button>
// );

const SelectMap: React.FC = () => {
    const navigate = useNavigate();
    const gameName = useGameStore((state: GameStore) => state.gameName);

    const confirmStageSelection = (mapName: string) => {
        clientSocket.emit("create game", { mapName, gameName }, joinToNewGame);
    };

    const joinToNewGame = ({ game_id }: { game_id: string }) => {
        console.log("Navigating to PendingGame with gameId:", game_id);
        navigate("/pending/" + game_id);
        // Add navigation logic to PendingGame with gameId
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
        <div className="w-full h-full py-20">
            <h2 className="max-w-7xl pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
                Select map
            </h2>
            <Carousel items={cards} />
        </div>
        // <div
        //     style={{
        //         backgroundImage: "url(/assets/images/menu/main_menu_bg.png)",
        //         backgroundSize: "cover",
        //         height: "100vh",
        //         display: "flex",
        //         flexDirection: "column",
        //         alignItems: "center",
        //         justifyContent: "center",
        //         color: "#f3f3f3",
        //     }}
        // >
        // </div>
    );
};

export default SelectMap;

