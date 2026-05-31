import openSocket, { Socket } from "socket.io-client"
const SOCKET_URL = import.meta.env.VITE_API_URL;

let socket: Socket | null = null;

function connectToSocket(): Socket {
    const token: string = localStorage.getItem("token") || ""
    socket = openSocket(SOCKET_URL, {
        transports: ["polling", "websocket"],
        query: { token }
    })
    return socket;
}

// Reconectar con token actualizado tras refresh
globalThis.addEventListener('auth:token-refreshed', () => {
    if (socket?.connected) {
        socket.disconnect();
        connectToSocket();
    }
});

export default connectToSocket
