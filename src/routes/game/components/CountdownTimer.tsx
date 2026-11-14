import { MdOutlineTimer } from "react-icons/md";
import clsx from "clsx";

type Props = {
    timeLeft: number;
    compact?: boolean;
};

// Format time as MM:SS
const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
};

const CountdownTimer = ({ timeLeft, compact }: Props) => (
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

export default CountdownTimer;
