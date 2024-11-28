import { GameSlotsProps } from "@utils/types";
import { Button } from "@components/index";

export const GameSlots = ({ data, onJoinGame }: GameSlotsProps) => (
    <ul>
        {data.map((game) => {
            if (!game) return null;
            return (
                <li key={game.id}>
                    <Button
                        text={`Join Game ${game.id}`}
                        onClick={() => onJoinGame(game.id)}
                    />
                </li>
            );
        })}
    </ul>
);

