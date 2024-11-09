"use client";
import { useEffect, useState } from "react";
// import { v4 as uuidv4 } from "uuid";
import socket from "../utils/socket";
// import { addToLocalStorage } from "./utils/local_storage";

type Props = {
    children: React.ReactNode;
};

export const Socket = ({ children }: Props) => {
    const [, setIsConnected] = useState(false);
    const [, setTransport] = useState("N/A");
    // const [socketId, setSocketId] = useState<string | null>(null);

    useEffect(() => {
        if (socket.connected) {
            onConnect();
            console.log("CONNECTED");
        }
        function onConnect() {
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name);
            socket.io.engine.on("upgrade", (transport: any) => {
                setTransport(transport.name);
            });
            // const socketId = uuidv4();
            // setSocketId(socketId);
            // addToLocalStorage({ key: "socket_id", value: socketId });
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
    }, []);

    return <>{children}</>;
};

