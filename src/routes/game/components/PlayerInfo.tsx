import { useState, useEffect } from "react";
import clientSocket from "@utils/socket";
import { pickedSpoilSocketData } from "@utils/types";

const DEFAULT_INFO = [
    { title: "Speed", value: 1 },
    { title: "Power", value: 1 },
    { title: "Bombs", value: 1 },
];

const PlayerInfo = () => {
    const [info, setInfo] = useState(DEFAULT_INFO);

    useEffect(() => {
        clientSocket.on("spoil was picked", handleUpdateGame);

        return () => {
            clientSocket.off("spoil was picked", handleUpdateGame);
        };
    }, []);

    const updateInfo = ({
        player_id,
        spoil_id,
        spoil_type,
    }: pickedSpoilSocketData) => {};

    return (
        <div>
            <ul className="flex gap-x-8 items-center">
                {info.map(({ title, value }) => (
                    <li key={title} className="text-2xl">
                        {title}: {value}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PlayerInfo;

