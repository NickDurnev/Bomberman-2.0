import { useState, useEffect } from "react";
import clientSocket from "@utils/socket";
import { pickedSpoilSocketData } from "@utils/types";
import { getDataFromLocalStorage } from "@utils/local_storage";
import { SPEED, POWER, BOMBS } from "@utils/constants";

const DEFAULT_INFO = [
    { title: "Speed", value: 1 },
    { title: "Power", value: 1 },
    { title: "Bomb", value: 1 },
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
                        { title: "Bomb", value: prev[2].value + 1 },
                    ]);
                    break;
            }
        }
    };

    return (
        <ul className="flex gap-x-8 items-center p-2 absolute top-[34px] left-[140px]">
            {info.map(({ title, value }) => (
                <li
                    key={title}
                    className="flex items-center gap-x-2 bg-black transition motion-preset-pop motion-loop-once rounded-lg px-3 py-1"
                >
                    <div className="rounded-full">
                        <img
                            src={`/assets/${title.toLowerCase()}_icon.png`}
                            alt={title}
                            className="w-[25px] h-[23px] rounded-full object-contain"
                        />
                    </div>
                    <p className="text-white text-sm">x{value}</p>
                </li>
            ))}
        </ul>
    );
};

export default PlayerInfo;

