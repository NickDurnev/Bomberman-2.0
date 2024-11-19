import React from "react";
import clientSocket from "@utils/socket";
import { AVAILABLE_MAPS } from "@utils/constants";

interface MapButtonProps {
    mapName: string;
    onSelect: (mapName: string) => void;
}

const MapButton: React.FC<MapButtonProps> = ({ mapName, onSelect }) => (
    <button
        onClick={() => onSelect(mapName)}
        style={{
            backgroundImage: `url(/assets/images/menu/${mapName}_preview.png)`,
            backgroundSize: "cover",
            width: "300px",
            height: "100px",
            border: "none",
            marginBottom: "20px",
            cursor: "pointer",
        }}
    >
        {mapName}
    </button>
);

const SelectMap: React.FC = () => {
    const confirmStageSelection = (mapName: string) => {
        console.log("mapName:", mapName);
        clientSocket.emit("create game", mapName, joinToNewGame);
    };

    const joinToNewGame = (gameId: number) => {
        console.log("Navigating to PendingGame with gameId:", gameId);
        // Add navigation logic to PendingGame with gameId
    };

    return (
        <div
            style={{
                backgroundImage: "url(/assets/images/menu/main_menu_bg.png)",
                backgroundSize: "cover",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#f3f3f3",
            }}
        >
            <h1
                style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    textShadow: "1px 1px #000000",
                    marginBottom: "20px",
                }}
            >
                Select Map
            </h1>
            <div
                style={{
                    background: "rgba(0, 0, 0, 0.5)",
                    borderRadius: "10px",
                    padding: "20px",
                    boxShadow: "0 0 10px rgba(0, 0, 0, 0.8)",
                    backdropFilter: "blur(10px)",
                }}
            >
                {AVAILABLE_MAPS.map((mapName) => (
                    <MapButton
                        key={mapName}
                        mapName={mapName}
                        onSelect={confirmStageSelection}
                    />
                ))}
            </div>
        </div>
    );
};

export default SelectMap;

