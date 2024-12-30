import { useState, useEffect } from "react";
import { MdOutlineTimer } from "react-icons/md";
import { GAME_DURATION } from "@utils/constants";

const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);

    useEffect(() => {
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
    }, []);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    return (
        <div className="flex items-center gap-x-2 bg-black transition motion-preset-pop motion-loop-once rounded-lg px-2 py-1">
            <MdOutlineTimer color="#fefefe" size={20} />
            <p className="text-large font-semibold text-white">
                {formatTime(timeLeft)}
            </p>
        </div>
    );
};

export default CountdownTimer;

