import { useState, useEffect } from "react";
import { GameStore } from "@utils/types";
import { useGameStore } from "@hooks/stores";
import { Input } from "@components/index";

type Props = {
    setIsBtnDisabled: (value: boolean) => void;
};

const NameInput = ({ setIsBtnDisabled }: Props) => {
    const changeGameName = useGameStore(
        (state: GameStore) => state.changeGameName
    );
    const [name, setName] = useState("");

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

    return (
        <div className="text-4xl font-extrabold tracking-wider text-center motion-preset-expand motion-loop-once">
            <Input
                placeholder="Game Name"
                onChange={handleChange}
                value={name}
                type="text"
                maxLength={30}
            />
        </div>
    );
};

export default NameInput;

