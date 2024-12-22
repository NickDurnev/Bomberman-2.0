import { useState, useEffect } from "react";
import clientSocket from "@utils/socket";
import { pickedSpoilSocketData } from "@utils/types";
import { getDataFromLocalStorage } from "@utils/local_storage";
import { SPEED, POWER, BOMBS } from "@utils/constants";

const DEFAULT_INFO = [
    { title: "Speed", value: 1 },
    { title: "Power", value: 1 },
    { title: "Bombs", value: 1 },
];

const PlayerInfo = () => {
    const [info, setInfo] = useState(DEFAULT_INFO);

    useEffect(() => {
        clientSocket.on("spoil was picked", updateInfo);

        return () => {
            clientSocket.off("spoil was picked", updateInfo);
        };
    }, []);

    const updateInfo = ({
        player_id,
        spoil_id,
        spoil_type,
    }: pickedSpoilSocketData) => {
        const storedSocketId = getDataFromLocalStorage("socket_id");

        if (player_id === storedSocketId) {
            switch (spoil_type) {
                case SPEED:
                    setInfo((prev) => [
                        ...prev,
                        { title: "Speed", value: prev[0].value + 1 },
                    ]);
                    break;
                case POWER:
                    setInfo((prev) => [
                        ...prev,
                        { title: "Power", value: prev[1].value + 1 },
                    ]);
                    break;
                case BOMBS:
                    setInfo((prev) => [
                        ...prev,
                        { title: "Bombs", value: prev[2].value + 1 },
                    ]);
                    break;
            }
        }
    };

    return (
        <div>
            <ul className="flex gap-x-8 items-center p-2">
                {info.map(({ title, value }) => (
                    <li
                        key={title}
                        className="flex items-center justify-center text-sm bg-accent text-white transition motion-preset-pop motion-loop-once rounded-lg px-4 py-2"
                    >
                        {title}: {value}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PlayerInfo;

