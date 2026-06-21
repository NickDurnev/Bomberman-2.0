import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

import { GOOGLE_USER_STORAGE_KEY, SOCKET_ID_KEY } from "@utils/constants";
import {
    addToLocalStorage,
    getDataFromLocalStorage,
} from "@utils/local_storage";

const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

// Stable, persistent player identity. Created once and reused across reconnects,
// so the server can identify the player even though socket.io assigns a new
// transport id on every (re)connection.
export const getOrCreateSocketId = (): string => {
    let socketId = getDataFromLocalStorage(SOCKET_ID_KEY) as string | null;
    if (!socketId) {
        socketId = uuidv4();
        addToLocalStorage({ key: SOCKET_ID_KEY, value: socketId });
    }
    return socketId;
};

const storedUser = getDataFromLocalStorage(GOOGLE_USER_STORAGE_KEY) as {
    email?: string;
    name?: string;
    picture?: string;
} | null;

// Send identity in the handshake so it is known to the server the instant the
// connection opens — before any lobby/gameplay event can run. This removes the
// race where a player joined/acted before "updateUserSocketId" was processed,
// and it re-establishes identity automatically on every reconnect.
const clientSocket = io(BASE_URL!, {
    auth: {
        socketId: getOrCreateSocketId(),
        email: storedUser?.email,
        name: storedUser?.name,
        picture: storedUser?.picture,
    },
});

export default clientSocket;
