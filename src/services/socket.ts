/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from "socket.io-client";
import { Capacitor } from "@capacitor/core";

let socket: Socket | null = null;

function connectToSocket(): Socket {
    // Singleton guard: reutilizar si ya existe y está conectado
    if (socket?.connected) return socket;

    const url: string = import.meta.env.VITE_API_URL;

    // Advertencia de configuración incorrecta en contexto nativo
    if (Capacitor.isNativePlatform() && url.includes("localhost")) {
        console.error(
            "[Socket] CONFIGURACIÓN INCORRECTA: se está usando 'localhost' en un entorno nativo.\n" +
            "En Android, 'localhost' apunta al propio dispositivo, no al servidor.\n" +
            "Usa el script correcto:\n" +
            "  → AVD:       npm run cap:android\n" +
            "  → Físico:    npm run cap:device"
        );
    }

    const token: string = localStorage.getItem("token") || "";

    socket = io(url, {
        // WebSocket primero: evita el bloqueo de HTTP polling en WebViews de Android
        transports: ["websocket", "polling"],
        query: { token },
    });

    return socket;
}

// Reconectar con token actualizado tras refresh
globalThis.addEventListener("auth:token-refreshed", () => {
    if (socket?.connected) {
        socket.disconnect();
        socket = null;
    }
    connectToSocket();
});

export default connectToSocket;
