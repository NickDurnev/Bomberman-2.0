import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { GAME_DURATION } from "@utils/constants";

export const useCountdown = (): number => {
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

    return timeLeft;
};
