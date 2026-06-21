import { IUser } from "../utils/types";

const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

export const addUser = async (user: IUser) => {
    try {
        const response = await fetch(`${BASE_URL}/api/v1/auth`, {
            method: "POST",
            body: JSON.stringify(user),
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        // Surface server-side rejections instead of silently discarding them —
        // a swallowed 422 here is why a player could end up never created in the DB.
        if (!response.ok) {
            console.error("addUser failed:", response.status, data);
        }
        return data;
    } catch (e) {
        console.error("addUser request error:", e);
    }
};

