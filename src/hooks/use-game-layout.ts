import { useEffect, useState } from "react";

const TOUCH_QUERY = "(any-pointer: coarse)";
const COMPACT_QUERY = "(max-width: 1119px), (max-height: 500px)";
const PORTRAIT_QUERY = "(orientation: portrait)";

const matches = (query: string) =>
    typeof window !== "undefined" && window.matchMedia(query).matches;

export const useGameLayout = () => {
    const [isTouch, setIsTouch] = useState(() => matches(TOUCH_QUERY));
    const [isCompact, setIsCompact] = useState(() => matches(COMPACT_QUERY));
    const [isPortrait, setIsPortrait] = useState(() => matches(PORTRAIT_QUERY));

    useEffect(() => {
        const subscribe = (query: string, setValue: (value: boolean) => void) => {
            const list = window.matchMedia(query);
            const onChange = () => setValue(list.matches);
            onChange();
            list.addEventListener("change", onChange);
            return () => list.removeEventListener("change", onChange);
        };

        const unsubscribers = [
            subscribe(TOUCH_QUERY, setIsTouch),
            subscribe(COMPACT_QUERY, setIsCompact),
            subscribe(PORTRAIT_QUERY, setIsPortrait),
        ];

        return () => unsubscribers.forEach(unsubscribe => unsubscribe());
    }, []);

    return { isTouch, isCompact, isPortrait };
};
