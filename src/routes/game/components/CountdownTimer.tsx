import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MdOutlineTimer } from "react-icons/md";
import { GAME_DURATION } from "@utils/constants";
import clsx from "clsx";

type Props = {
    compact?: boolean;
};

const CountdownTimer = ({ compact }: Props) => {
    const { gameId } = useParams();
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);

    useEffect(() => {
        setTimeLeft(GAME_DURATION);

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 0) {
                    clearInterval(timer); // Stop the timer when it reaches 0
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer); // Cleanup on component unmount
    }, [gameId]);

    useEffect(() => {
        setTimeLeft(GAME_DURATION);
    }, [gameId]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    return (
        <div className="flex items-center gap-x-2 bg-black border border-[#1f2937] transition motion-preset-pop motion-loop-once rounded-lg px-2 py-1">
            <MdOutlineTimer color="#fefefe" size={compact ? 16 : 20} />
            <p
                className={clsx(
                    "font-semibold text-white",
                    compact ? "text-sm" : "text-large",
                )}
            >
                {formatTime(timeLeft)}
            </p>
        </div>
    );
};

export default CountdownTimer;

