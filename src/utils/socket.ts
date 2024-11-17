import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

const clientSocket = io(BASE_URL!);

export default clientSocket;

