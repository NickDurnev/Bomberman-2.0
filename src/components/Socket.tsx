import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { SOCKET_ID_KEY } from "@utils/constants";
import {
    addToLocalStorage,
    getDataFromLocalStorage,
} from "@utils/local_storage";
import socket from "@utils/socket";

interface Transport {
    name: string;
}

type Props = {
    children: React.ReactNode;
};

export const Socket = ({ children }: Props) => {
    const { user } = useAuth0();
    const [isConnected, setIsConnected] = useState(false);
    const [transport, setTransport] = useState("N/A");
    const [socketId, setSocketId] = useState<string | null>(null);

    useEffect(() => {
        if (socket.connected) {
            onConnect();
        }
        function onConnect() {
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name);
            socket.io.engine.on("upgrade", (transport: Transport) => {
                setTransport(transport.name);
            });

            const storedSocketId = getDataFromLocalStorage(SOCKET_ID_KEY);
            let socketId = null;
            if (storedSocketId) {
                socketId = storedSocketId;
            } else {
                socketId = uuidv4();
                addToLocalStorage({
                    key: SOCKET_ID_KEY,
                    value: socketId,
                });
            }
            setSocketId(socketId);
            socket.emit("updateUserSocketId", {
                email: user?.email,
                socket_id: socketId,
            });
        }
        function onDisconnect() {
            setIsConnected(false);
            setTransport("N/A");
        }
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, [user, socketId, transport, isConnected]);

    return <>{children}</>;
};

