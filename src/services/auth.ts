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
        return await response.json();
    } catch (e) {
        console.log(e);
    }
};

