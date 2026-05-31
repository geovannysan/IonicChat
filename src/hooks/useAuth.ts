/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { useDataStore, type ChatItem } from "../stores/useTicketsChat";
import apiService from "@/services/api";
import connectToSocket from "@/services/socket";
import { App } from "@capacitor/app";
const playNotificationSound = () => {
    try {
        const audioContext = new (globalThis.AudioContext || (globalThis as any).webkitAudioContext)();
        if (!audioContext) {
            console.warn("Web Audio API is not supported by this browser.");
            return;
        }
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        console.error("Could not play notification sound", e);
    }
};

export const useAuth = () => {
    const history = useHistory();

    const [messagesState, setMessagesState] = useState<any[]>([]);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const primer = JSON.parse(localStorage.getItem("user") || "null");
    const [user, setUser] = useState<any | null>(primer === "null" ? null : primer);
    const [empresaIdAnterior, setEmpresaIdAnterior] = useState<string | null>(null);
    const [empresaIdActual, setEmpresaIdActual] = useState<string | null>(null);
    const [ticketChats, setTicketChats] = useState<ChatItem>({
        id: 0,
        status: '',
        unreadMessages: 0,
        lastMessage: '',
        isGroup: false,
        userId: null,
        contactId: 0,
        whatsappId: 0,
        queueId: null,
        createdAt: '',
        updatedAt: '',
        ChatPerfil: {
            conexionID: 0,
            conexiontype: {
                id: 0,
                tipo: ''
            },
            id: 0
        },
        Contact: {
            id: 0,
            name: '',
            number: '',
            profilePicURl: '',
            typeContact: '',
            isGroup: false,
            createdAt: '',
            updatedAt: '',
            extraInfo: []
        }
    });

    const [anality, setAnality] = useState<{
        status: any[]
        tiempoPromedio: any[],
        data: any[],
        promedio: any[]
    }>();

    const { addChatTickte, addChatnotify, deleteChat, deleteNotify, fetchUsers } = useDataStore();
    const currentRoomRef = useRef<any | null>(null);
    const [socket, setSocket] = useState<any>(null);

    // Verificar token al inicializar
    useEffect(() => {
        const token = localStorage.getItem("token");
        const users = localStorage.getItem("user")
        if (users && token) {
            (async () => {
                try {
                    apiService.setToken(token);
                    setIsAuth(true);
                    setLoading(false);
                    // globalThis.location.href = "/tabs/chat"
                    setUser(JSON.parse(users ?? ""))
                    await apiService.request("/Users/acount/" + user.cuenta.find((el: any) => el.accountId == user.perfil).id, {
                        method: "PUT",
                        data: {
                            idWorkspace: localStorage.getItem("pushId")
                        }
                    })
                } catch (err: any) {
                    const errorData = err?.response?.data;
                    if (errorData?.mensaje === "ERR_SESSION_EXPIRED" ||
                        errorData?.mensaje === "Token inválido") {
                        localStorage.removeItem("token");
                        setIsAuth(false);
                        setLoading(false);
                        globalThis.location.href = "/"
                    }
                }
            })();
        } else {
            setLoading(false);
        }
    }, []);

    // Configurar socket cuando el usuario esté autenticado
    useEffect(() => {
        if (!user?.id) return;

        if (!currentRoomRef.current) {
            const s = connectToSocket();
            currentRoomRef.current = s;
            setSocket(s);
            console.log("conectados")
        }

        const socket = currentRoomRef.current;

        const handleUser = (data: any) => {
            if (data.action === "update" && data.user.id === user.id) {
                setUser(data.user);
            }
        };
        const handleAppStateChange = ({ isActive }: { isActive: boolean }) => {
            if (isActive) {
                console.log("App activa: verificando socket...");
                if (!socket.connected) {
                    socket.connect(); // Fuerza la reconexión al volver
                }
            }
        };

        // Registramos el listener de Capacitor
        const appStateListener = App.addListener('appStateChange', handleAppStateChange);
        const handleChatCerrar = (data: any) => {
            if (data.action === "delete") {
                deleteChat(Number(data.ticket));
                setTicketChats({ id: 0 } as ChatItem);
                deleteNotify(data.ticket + "-message");
            }
        };

        const handleConnect = () => {
            socket.emit("joinChatList");
        };

        const handleTickemesa = (data: any) => {
            console.log("tickemesa recibido:", data);
            if (data.ticket) {
                addChatTickte(data.ticket);
            }
            if (data.notify) {
                const { Ticket: ticket, fromMe } = data.notify;
                if (fromMe || ticket.userId !== user.id) return;
                const notify = {
                    "id": ticket.id + "-message",
                    "body": ticket.lastMessage,
                    "title": "Nuevo Mensaje de " + ticket.Contact?.name,
                    "type": "mensaje",
                    "objeto": ticket
                };
                addChatnotify(notify);
                playNotificationSound();
            }
        };

        socket.on("user", handleUser);
        socket.on("chatcerrar", handleChatCerrar);
        socket.on("connect", handleConnect);
        socket.on("tickemesa", handleTickemesa);

        if (socket.connected) {
            socket.emit("joinChatList");
        }

        return () => {
            socket.off("user", handleUser);
            socket.off("chatcerrar", handleChatCerrar);
            socket.off("connect", handleConnect);
            socket.off("tickemesa", handleTickemesa);
            appStateListener.then(l => l.remove());
        };
    }, [user, addChatTickte, addChatnotify, deleteChat, deleteNotify]);

    // Manejo de empresa/cuenta
    useEffect(() => {
        if (!user?.perfil) return;

        const socket = currentRoomRef.current;
        if (!socket) return;

        if (empresaIdActual && empresaIdActual !== empresaIdAnterior) {
            socket.emit("leaveEmpresaRoom", empresaIdActual);
        }

        if (empresaIdActual !== empresaIdAnterior) {
            socket.emit("joinEmpresaRoom", empresaIdAnterior);
            setEmpresaIdActual(empresaIdAnterior);

            apiService.getAnalytics().then((response: any) => {
                setAnality(response.data);
            }).catch(console.error);
        }
    }, [empresaIdAnterior, empresaIdActual, user?.perfil]);

    const handleLogin = async (userData: { email: string, password: string }) => {
        setLoading(true);
        try {
            const datas: { token: string, user:any } = await apiService.login(userData.email, userData.password);
            const data = datas

            localStorage.setItem("token", data.token);
            apiService.setToken(data.token);
            localStorage.setItem("user", JSON.stringify(data.user))
            setUser(data.user);
            setIsAuth(true);

            // Cargar datos iniciales
            setTimeout(async () => {
                try {
                    await fetchUsers(1);
                    setEmpresaIdAnterior(data.user.perfil);
                } catch (error) {
                    console.error("Error cargando datos:", error);
                }
            }, 200);

        } catch (error: any) {
            console.error("Error en login:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {

            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (currentRoomRef.current) {
                currentRoomRef.current.disconnect();
            }

            //await apiService.logout();
            apiService.setToken('');
            setUser({});
            setIsAuth(false);
            history.push("/login");
        } catch (err) {
            console.error("Error en logout:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCuenta = async (id: number, cuentaId: string) => {
        try {
            const newuser: any = await apiService.updateUser(id, { chatperfliid: cuentaId });
            setEmpresaIdAnterior(cuentaId);
            localStorage.setItem("user", JSON.stringify(newuser))
            setUser(newuser)
            globalThis.location.href = "/tabs/chat"

            setTimeout(async () => {
                await fetchUsers(1);
            }, 100);
        } catch (error) {
            console.error("Error cambiando cuenta:", error);
            throw error;
        }
    };

    return {
        isAuth,
        user,
        setUser,
        loading,
        handleLogin,
        handleLogout,
        socket,
        handleCuenta,
        setEmpresaIdActual,
        empresaIdActual,
        ticketChats,
        setTicketChats,
        anality,
        messagesState,
        setMessagesState,
        addChatTickte, addChatnotify, deleteChat, deleteNotify
    };
};
