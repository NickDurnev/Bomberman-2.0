import clsx from "clsx";
import type { Info } from "../hooks/usePlayerInfo";

type Props = {
    info: Info[];
    lastInfo: Info | null;
    hidden: boolean;
    isDead: boolean;
    compact?: boolean;
};

const PlayerStats = ({ info, lastInfo, hidden, isDead, compact }: Props) => (
    <ul className={clsx("flex items-center", compact ? "gap-x-2" : "gap-x-8")}>
        {info.map(({ title, value }) => (
            <li
                key={title}
                className={clsx(
                    "motion-preset-pop motion-loop-once flex items-center gap-x-2 rounded-lg border border-[#1f2937] bg-black py-1 transition",
                    compact ? "px-2" : "px-3",
                )}
            >
                <div className="rounded-full">
                    <img
                        src={`/assets/${title.toLowerCase()}_icon.png`}
                        alt={title}
                        className={clsx(
                            "rounded-full object-contain",
                            compact ? "h-[18px] w-[20px]" : "h-[23px] w-[25px]",
                        )}
                    />
                </div>
                <p className="text-sm text-white">x{value}</p>
            </li>
        ))}
        {lastInfo && (
            <li
                key="notification"
                className={clsx(
                    "flex items-center gap-x-2 rounded-lg bg-transparent px-3 transition-opacity duration-500",
                    hidden ? "opacity-0" : "opacity-100",
                )}
            >
                <p
                    className="font-bold text-lg"
                    style={{
                        color: lastInfo.color,
                    }}
                >
                    +1 {lastInfo.title}
                </p>
            </li>
        )}
        {isDead && (
            <li
                key="notification"
                className={clsx(
                    "flex items-center gap-x-2 rounded-lg bg-transparent px-3 transition-opacity duration-500",
                    hidden ? "opacity-0" : "opacity-100",
                )}
            >
                <p className="font-bold text-lg text-white">You died</p>
            </li>
        )}
    </ul>
);

export default PlayerStats;
