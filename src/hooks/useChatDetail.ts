import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams,  } from 'react-router-dom';
import { useDataStore } from '../stores/useTicketsChat';
import { useAuthContext } from '@/contexts/AuthContext';

export const useChatDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { socket } = useAuthContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevScrollHeight = useRef<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [message, setMessage] = useState('');

  const {
    chats,
    ticketChat,
    chatHistory,
    fetchUsers,
    fetchChatHistory,
    fetchChatHistoryAdd,
    setSelectedTicketChat,
    hasMorechat,
    isLoading,
    addMessage,
  } = useDataStore();

  const handleMessage = useCallback((data: { message: { ticketid: number } }) => {
    if (!data?.message) return;
    const msg = data.message;

    if (id != null && String(id) !== String(msg.ticketid)) return;

    const isAtBottom = scrollRef.current
      ? scrollRef.current.scrollHeight - scrollRef.current.scrollTop - scrollRef.current.clientHeight < 15
      : false;

    addMessage(msg);

    if (isAtBottom) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  }, [id, addMessage]);

  const handleMessageRef = useRef(handleMessage);
  handleMessageRef.current = handleMessage;

  const handleScrolltop = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight } = e.currentTarget;

    if (!hasMorechat || isLoading) return;
    if (scrollTop === 0) {
      prevScrollHeight.current = scrollHeight;
      loadMore();
    }
  };

  const loadMore = async () => {
    if (!hasMorechat || isLoading) return;

    const nextPage = pageNumber + 1;
    setPageNumber(nextPage);
    await new Promise((res) => setTimeout(res, 1500));
    await fetchChatHistoryAdd(ticketChat.id || Number(id), nextPage);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setMessage('');
    console.log('Enviando mensaje:', message);
  };

  // Cargar historial y sincronizar ticketChat desde la lista
  useEffect(() => {
    if (!id || Number(id) === 0) return;
    const ticketId = parseInt(id, 10);

    if (ticketChat.id !== ticketId) {
      const found = chats.find((c) => c.id === ticketId);
      if (found) {
        setSelectedTicketChat(found);
      } else if (chats.length === 0) {
        fetchUsers(1);
      }
    }

    fetchChatHistory(ticketId, 1);
    setPageNumber(1);
  }, [id, fetchChatHistory, chats, ticketChat.id, setSelectedTicketChat, fetchUsers]);

  // Si la lista de chats se carga después, asignar el ticketChat correspondiente
  useEffect(() => {
    if (!id || Number(id) === 0) return;
    const ticketId = parseInt(id, 10);
    if (ticketChat.id !== ticketId && chats.length > 0) {
      const found = chats.find((c) => c.id === ticketId);
      if (found) {
        setSelectedTicketChat(found);
      }
    }
  }, [id, chats, ticketChat.id, setSelectedTicketChat]);

  // Gestión del ciclo de vida del socket: join al montar, leave al desmontar.
  // El cleanup garantiza que no queden listeners huérfanos ni sobrecargas en el backend.
  useEffect(() => {
    if (!socket || !id || Number(id) === 0) return;

    const chatId = String(id);

    const onAppMessage = (data: { message: { ticketid: number } }) => {
      handleMessageRef.current(data);
    };

    const handleJoin = () => {
      socket.emit('joinChatBox', chatId);
      console.log('Conectado al chat:', chatId);
    };

    // Registrar listener de mensajes
    socket.on('appMessage', onAppMessage);

    // Unirse a la sala si el socket ya está conectado
    if (socket.connected) {
      handleJoin();
    }

    // Si se reconecta el socket mientras estamos en esta pantalla, volver a unirse
    socket.on('connect', handleJoin);

    return () => {
      // Limpiar listeners para evitar ejecuciones huérfanas
      socket.off('appMessage', onAppMessage);
      socket.off('connect', handleJoin);

      // Abandonar la sala al desmontar (evita sobrecargas y mensajes no deseados)
      socket.emit('leaveChatBox', chatId);
      console.log('Desconectado del chat:', chatId);
    };
  }, [socket, id]);

  return {
    ticketChat,
    chatHistory,
    isLoading,
    message,
    setMessage,
    scrollRef,
    handleScrolltop,
    handleSendMessage,
  };
};
