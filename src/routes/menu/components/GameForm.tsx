import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import { Emoji } from "react-apple-emojis";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button, Input } from "@components/index";
import { useGameStore } from "@hooks/stores";
import clientSocket from "@utils/socket";
import { GameStore } from "@utils/types";

const GameForm = () => {
    const { isAuthenticated } = useAuth0();
    const changeGameName = useGameStore(
        (state: GameStore) => state.changeGameName,
    );
    const [name, setName] = useState("");
    const [isBtnDisabled, setIsBtnDisabled] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        return () => {
            changeGameName(name);
        };
    }, [changeGameName, name]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        if (e.target.value.length <= 2) {
            setIsBtnDisabled(true);
        } else {
            setIsBtnDisabled(false);
        }
    };

    const checkGameName = () => {
        clientSocket.emit("check game name", name, handleHostGame);
    };

    const handleHostGame = ({ isAvailable }: { isAvailable: boolean }) => {
        if (isAvailable) {
            clientSocket.emit("leave lobby");
            navigate("/map");
        } else {
            toast("Game name already in use");
        }
    };

    return (
        <>
            <div className="motion-preset-expand motion-loop-once text-center font-extrabold text-4xl tracking-wider">
                <Input
                    placeholder="Game Name"
                    onChange={handleChange}
                    value={name}
                    type="text"
                    maxLength={30}
                />
            </div>
            <Button
                text="New Game"
                onClick={checkGameName}
                animated
                animatedIcon={<Emoji name="video-game" width={20} />}
                disabled={isBtnDisabled || !isAuthenticated}
            />
        </>
    );
};

export default GameForm;

