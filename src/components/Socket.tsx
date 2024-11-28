"use client";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { v4 as uuidv4 } from "uuid";
import socket from "../utils/socket";
import { addToLocalStorage } from "@utils/local_storage";

type Props = {
    children: React.ReactNode;
};

export const Socket = ({ children }: Props) => {
    const { user } = useAuth0();
    console.log("user:", user);
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
            socket.io.engine.on("upgrade", (transport: any) => {
                setTransport(transport.name);
            });
            const socketId = uuidv4();
            setSocketId(socketId);
            socket.emit(
                "updateUserSocketId",
                { email: user?.email, socket_id: socketId },
                (response: any) => {
                    console.log("Response from server:", response);
                    // Handle response from server here
                }
            );
            addToLocalStorage({ key: "socket_id", value: socketId });
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

