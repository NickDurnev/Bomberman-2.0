import { useAuth } from "@contexts/AuthContext";
import React, { useEffect, useState } from "react";

import socket, { getOrCreateSocketId } from "@utils/socket";

interface Transport {
    name: string;
}

type Props = {
    children: React.ReactNode;
};

export const Socket = ({ children }: Props) => {
    const { user } = useAuth();
    const [, setIsConnected] = useState(socket.connected);
    const [, setTransport] = useState("N/A");

    // Connection lifecycle — registered exactly once. Previously these handlers
    // (and the engine "upgrade" listener) were re-subscribed on every state
    // change, leaking listeners and re-emitting identity repeatedly.
    useEffect(() => {
        const onConnect = () => {
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name);
            socket.io.engine.on("upgrade", (transport: Transport) => {
                setTransport(transport.name);
            });
        };
        const onDisconnect = () => {
            setIsConnected(false);
            setTransport("N/A");
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        if (socket.connected) {
            onConnect();
        }

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, []);

    // Associate the logged-in user's email with the stable socket id. The
    // identity (socketId) itself travels in the handshake (see utils/socket.ts);
    // this only covers users who log in mid-session, so the server's DB mapping
    // is updated. Re-emitted on reconnect.
    useEffect(() => {
        if (!user?.email) {
            return;
        }
        const emitIdentity = () => {
            socket.emit("updateUserSocketId", {
                email: user.email,
                socket_id: getOrCreateSocketId(),
            });
        };
        if (socket.connected) {
            emitIdentity();
        }
        socket.on("connect", emitIdentity);
        return () => {
            socket.off("connect", emitIdentity);
        };
    }, [user]);

    return <>{children}</>;
};

