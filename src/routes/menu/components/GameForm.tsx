import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Emoji } from "react-apple-emojis";

import { GameStore } from "@utils/types";
import clientSocket from "@utils/socket";
import { useGameStore } from "@hooks/stores";
import { Input, Button } from "@components/index";

const GameForm = () => {
    const { isAuthenticated } = useAuth0();
    const changeGameName = useGameStore(
        (state: GameStore) => state.changeGameName
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
            <div className="text-4xl font-extrabold tracking-wider text-center motion-preset-expand motion-loop-once">
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

