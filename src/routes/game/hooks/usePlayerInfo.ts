import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import clientSocket, { getOrCreateSocketId } from "@utils/socket";
import { pickedSpoilSocketData } from "@utils/types";
import {
    SPEED,
    POWER,
    BOMBS,
    DELAY,
    MAX_SPEED,
    MIN_DELAY,
    INITIAL_DELAY,
    INITIAL_SPEED,
    STEP_DELAY,
    STEP_SPEED,
} from "@utils/constants";

const DEFAULT_INFO = [
    { title: "Speed", value: 1, color: "#37bf2e" },
    { title: "Power", value: 1, color: "#f9b727" },
    { title: "Bomb", value: 1, color: "#c347ee" },
];

const DELAY_INFO = { title: "Delay", value: 2, color: "#5B5FCD" };

export type Info = {
    title: string;
    value: number;
    color: string;
};

const MAX_SPEED_VALUE = (MAX_SPEED - INITIAL_SPEED) / STEP_SPEED;
const MAX_DELAY_VALUE = (INITIAL_DELAY - MIN_DELAY) / STEP_DELAY;

export const usePlayerInfo = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const [info, setInfo] = useState<Info[]>(DEFAULT_INFO);
    const [lastInfo, setLastInfo] = useState<Info | null>(null);
    const [hidden, setHidden] = useState(false);
    const [isDead, setIsDead] = useState(false);

    let isDelaySpoil = false;

    useEffect(() => {
        if (gameId) {
            setInfo(DEFAULT_INFO);
            setIsDead(false);
        }
        clientSocket.on("spoil was picked", updateInfo);

        clientSocket.on("show tombstone", playerDied);

        return () => {
            clientSocket.off("spoil was picked", updateInfo);
            clientSocket.off("show tombstone", playerDied);
        };
    }, [gameId]);

    const updateInfo = ({ player_id, spoil_type }: pickedSpoilSocketData) => {
        if (player_id === getOrCreateSocketId()) {
            processInfo(spoil_type);
        }
    };

    const playerDied = ({ player_id }: { player_id: string }) => {
        if (player_id === getOrCreateSocketId()) {
            setIsDead(true);
        }
    };

    const processInfo = (spoil_type: number) => {
        if (spoil_type === SPEED) {
            setInfo((prev) =>
                prev.map((item) => {
                    if (item.title === "Speed") {
                        if (item.value >= MAX_SPEED_VALUE) {
                            return item;
                        }
                        setLastInfo(item);
                        triggerHide();
                        return {
                            ...item,
                            value: item.value + 1,
                        };
                    }
                    return item;
                })
            );
        } else if (spoil_type === POWER) {
            setInfo((prev) =>
                prev.map((item) => {
                    if (item.title === "Power") {
                        setLastInfo(item);
                        triggerHide();
                        return {
                            ...item,
                            value: item.value + 1,
                        };
                    }
                    return item;
                })
            );
        } else if (spoil_type === BOMBS) {
            setInfo((prev) =>
                prev.map((item) => {
                    if (item.title === "Bomb") {
                        setLastInfo(item);
                        triggerHide();
                        return {
                            ...item,
                            value: item.value + 1,
                        };
                    }
                    return item;
                })
            );
        } else if (spoil_type === DELAY) {
            if (isDelaySpoil) {
                setInfo((prev) =>
                    prev.map((item) => {
                        if (item.title === "Delay") {
                            if (item.value >= MAX_DELAY_VALUE) {
                                return item;
                            }
                            setLastInfo(item);
                            triggerHide();
                            return {
                                ...item,
                                value: item.value + 1,
                            };
                        }
                        return item;
                    })
                );
            } else {
                isDelaySpoil = true;
                setInfo((prev) => {
                    if (prev.some((item) => item.title === "Delay")) {
                        return prev; // Avoid duplicate "Delay" entries
                    }
                    return [...prev, DELAY_INFO];
                });
            }
        }
    };

    const triggerHide = () => {
        setHidden(false); // Reset state to make the element visible
        setTimeout(() => setHidden(true), 1000); // Start hiding after 1 second
        setTimeout(() => setLastInfo(null), 1500); // Remove from DOM after transition
    };

    const backToMenu = () => {
        clientSocket.emit("player disconnect", {
            player_id: getOrCreateSocketId(),
        });
        navigate("/");
    };

    return { info, lastInfo, hidden, isDead, backToMenu };
};
