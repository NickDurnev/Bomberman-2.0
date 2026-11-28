import { useSyncExternalStore } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import {
  GOOGLE_USER_STORAGE_KEY,
  PROTOCOL_VERSION,
  SOCKET_ID_KEY,
} from "@/utils/constants";
import {
  addToLocalStorage,
  getDataFromLocalStorage,
} from "@/utils/local_storage";

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
    protocol: PROTOCOL_VERSION,
  },
});

export type ProtocolStatus = "ok" | "client-old" | "server-old";

let protocolStatus: ProtocolStatus = "ok";
const protocolListeners = new Set<() => void>();

function setProtocolStatus(next: ProtocolStatus): void {
  if (next === protocolStatus) {
    return;
  }
  protocolStatus = next;
  for (const listener of protocolListeners) {
    listener();
  }
}

// The server rejects an old client with connect_error "protocol". Stop the
// reconnect loop: a retry gets the same answer.
const onConnectError = (error: Error) => {
  if (error.message !== "protocol") {
    return;
  }
  clientSocket.io.opts.reconnection = false;
  clientSocket.disconnect();
  setProtocolStatus("client-old");
};
clientSocket.on("connect_error", onConnectError);

// The `get current game` ack carries the server protocol. An older server
// sends none.
export function markServerProtocol(protocol: number | undefined): void {
  if (protocol !== PROTOCOL_VERSION) {
    setProtocolStatus("server-old");
  }
}

const subscribeProtocol = (onChange: () => void) => {
  protocolListeners.add(onChange);
  return () => {
    protocolListeners.delete(onChange);
  };
};

const getProtocolStatus = () => protocolStatus;

export function useProtocolStatus(): ProtocolStatus {
  return useSyncExternalStore(
    subscribeProtocol,
    getProtocolStatus,
    getProtocolStatus,
  );
}

export default clientSocket;
