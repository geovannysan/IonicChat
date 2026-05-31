import { useEffect, useState, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDataStore } from '../stores/useTicketsChat';
import { useAuthContext } from '@/contexts/AuthContext';

export const useChatDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { socket } = useAuthContext();
  const history = useHistory();
  const scrollRef = useRef<any>(null);
  const prevScrollHeight = useRef<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [message, setMessage] = useState('');

  const {
    ticketChat,
    chatHistory,
    fetchChatHistory,
    fetchChatHistoryAdd,
    hasMorechat,
    isLoading,
    addMessage
  } = useDataStore();

  const handleMessage = (data:{message: {ticketid: number}}) => {
    if (!data?.message) return;
    const msg = data.message;

    if (id != null && String(id) !== String(msg.ticketid)) return;

    const isAtBottom = scrollRef.current
      ? (() => {
          const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
          return scrollHeight - scrollTop - clientHeight < 15;
        })()
      : false;

    addMessage(msg);

    if (isAtBottom) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  };

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
    await fetchChatHistoryAdd(ticketChat.id, nextPage);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setMessage('');
    console.log('Enviando mensaje:', message);
  };

  useEffect(() => {
    if (id && ticketChat.id !== parseInt(id)) {
      history.push('/tabs/chat');
    }
  }, [id, ticketChat.id, history]);

  useEffect(() => {
    if (ticketChat.id) {
      fetchChatHistory(ticketChat.id, 1);
      setPageNumber(1);
    }
  }, [ticketChat.id, ticketChat.contactId, fetchChatHistory]);

  useEffect(() => {
    if (!socket) return;

    const join = () => {
      socket.on("appMessage", handleMessage);
      if (Number(id) !== 0 && id != null) {
        socket.emit("joinChatBox", String(id));
        console.log("Conectado al chat:", id);
      }
    };

    if (socket.connected) {
      join();
    } else {
      socket.once("connect", join);
    }

    return () => {
      socket.off("appMessage", handleMessage);
      socket.off("connect", join);
      if (id) {
        socket.emit("leaveChatBox", String(id));
      }
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
    handleSendMessage
  };
};
