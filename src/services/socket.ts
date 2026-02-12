import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL; // Exactamente igual que dashboard-chat

export function connectToSocket() {
    const token: string = localStorage.getItem("token") || "";
    
    return io(SOCKET_URL, {
        transports: ["websocket", "polling", "flashsocket"],
        query: {
            token: token || ""
        }
    });
}

export default connectToSocket;
