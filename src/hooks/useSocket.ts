/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * useSocket
 *
 * Expone el socket ya creado por useAuth/AuthContext.
 * NO crea una instancia propia — evita conexiones duplicadas.
 */
import { useAuthContext } from "../contexts/AuthContext";

export const useSocket = () => {
    const { socket } = useAuthContext();

    return {
        socket,
        isConnected: socket?.connected ?? false,
    };
};
