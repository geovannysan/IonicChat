/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import  connectToSocket  from '../services/socket';
import { useAuthContext } from '../contexts/AuthContext';
import { useDataStore } from '../stores/useTicketsChat';

export const useSocket = () => {
  const { user, isAuth } = useAuthContext();
  const { addChatTickte, addChatnotify, deleteChat, deleteNotify } = useDataStore();
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!isAuth || !user?.id) {
      return;
    }

    // Conectar socket
    if (!socketRef.current) {
      socketRef.current = connectToSocket();
    }

    const socket = socketRef.current;

    // Eventos del socket exactamente como en dashboard-chat
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("joinChatList");
    });

    socket.on("disconnect", (reason: string) => {
      console.log("Socket disconnected:", reason);
    });

    socket.on("user", (data: any) => {
      if (data.action === "update" && data.user.id === user.id) {
        // Actualizar datos del usuario si es necesario
        console.log("User updated:", data.user);
      }
    });

    socket.on("Perfil", (data: any) => {
      // Actualizar perfil de canal
      console.log("Profile updated:", data.session);
    });

    socket.on("chatcerrar", (data: any) => {
      if (data.action === "delete") {
        deleteChat(Number(data.ticket));
        deleteNotify(data.ticket + "-message");
      }
    });

    socket.on("tickemesa", (data: any) => {
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
        
        // Reproducir sonido de notificación
        playNotificationSound();
      }
    });

    socket.on("connect_error", (error: any) => {
      console.error("Socket connection error:", error);
    });

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuth, user?.id, addChatTickte, addChatnotify, deleteChat, deleteNotify]);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false
  };
};
