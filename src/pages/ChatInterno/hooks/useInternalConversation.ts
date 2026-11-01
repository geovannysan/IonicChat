import { useState, useCallback, useEffect, useRef } from 'react';
import chatMessagesService from '../services/chat-messages.service';
import chatSocketService from '../services/chat-socket.service';
import type { ChatMessage } from '../models/chat-message.interface';

interface UseInternalConversationOptions {
  myUserId: number;
  otherUserId: number;
  socket: ReturnType<typeof import('../services/chat-socket.service').default.subscribeToConversation> extends (...args: unknown[]) => unknown ? unknown : unknown;
}

interface UseInternalConversationReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  hasMore: boolean;
  error: string | null;
  inputValue: string;
  setInputValue: (v: string) => void;
  sendMessage: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook con responsabilidad única: gestionar el ciclo de vida completo
 * de una conversación interna (carga, paginación, envío, socket).
 */
export function useInternalConversation(
  myUserId: number,
  otherUserId: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socket: any,
): UseInternalConversationReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  // Ref para saber si el componente está montado (evitar setState tras unmount)
  const mountedRef = useRef(true);

  // Guardamos los IDs actuales para usarlos en el cleanup de desmontaje,
  // independientemente de cuántas veces el efecto del socket se re-ejecute.
  const joinedRoomRef = useRef<{ myUserId: number; otherUserId: number } | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ── Carga inicial ──────────────────────────────────────────────────────────
  const loadConversation = useCallback(async (targetPage: number, replace = false) => {
    if (!myUserId || !otherUserId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await chatMessagesService.getConversation(
        myUserId,
        otherUserId,
        targetPage,
      );

      if (!mountedRef.current) return;

      // Los mensajes más antiguos vienen primero desde el backend en cada página.
      // Al cargar más páginas (scroll hacia arriba), los prepend al array.
      setMessages((prev) =>
        replace
          ? result.messages
          : [...result.messages, ...prev],
      );
      setHasMore(result.hasMore);
      setPage(targetPage);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Error cargando mensajes');
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [myUserId, otherUserId]);

  // ── Carga inicial al montar ────────────────────────────────────────────────
  useEffect(() => {
    if (myUserId && otherUserId) {
      loadConversation(1, true);
    }
  }, [myUserId, otherUserId, loadConversation]);

  // ── Socket: suscripción a mensajes en tiempo real ─────────────────────────
  useEffect(() => {
    if (!socket || !myUserId || !otherUserId) return;

    chatSocketService.setSocket(socket);

    // Unirse a la sala del backend al montar / cuando cambia la conversación
    chatSocketService.joinInternalChat(myUserId, otherUserId);
    joinedRoomRef.current = { myUserId, otherUserId };
    console.log('[InternalChat] joinInternalChat', myUserId, otherUserId);

    // Suscribir al evento de socket para recibir mensajes nuevos
    const unsubscribe = chatSocketService.subscribeToConversation(
      myUserId,
      otherUserId,
      (newMsg) => {
        if (!mountedRef.current) return;
        // Solo agregar si no está ya en el array (evitar duplicados al enviar)
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === newMsg.id);
          if (exists) return prev;
          return [...prev, newMsg];
        });
      },
    );

    return () => {
      // El cleanup del efecto se llama:
      //   1. Cuando cambia socket/myUserId/otherUserId  →  salimos de la sala anterior
      //   2. Cuando el componente se desmonta           →  igual, salimos de la sala
      // En ambos casos es correcto: si cambian los IDs abrimos una sala nueva,
      // si se desmonta cerramos la sala definitivamente.
      unsubscribe();
      if (joinedRoomRef.current) {
        const { myUserId: uid, otherUserId: oid } = joinedRoomRef.current;
        chatSocketService.leaveInternalChat(uid, oid);
        joinedRoomRef.current = null;
      }
    };
  }, [socket, myUserId, otherUserId]);

  // // ── Marcar como leído al entrar ────────────────────────────────────────────
  // useEffect(() => {
  //   if (myUserId && otherUserId) {
  //     chatMessagesService.markAsRead(myUserId, otherUserId);
  //   }
  // }, [myUserId, otherUserId]);

  // ── Enviar mensaje ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || isSending) return;

    setIsSending(true);
    setInputValue('');

    try {
      const newMsg = await chatMessagesService.sendMessage(
        myUserId,
        otherUserId,
        content,
      );
      if (!mountedRef.current) return;
      // Agregar optimistamente si el socket no lo entrega
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === newMsg.id);
        return exists ? prev : [...prev, newMsg];
      });
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Error enviando mensaje');
      // Restaurar el texto en el input si falló
      setInputValue(content);
    } finally {
      if (mountedRef.current) setIsSending(false);
    }
  }, [inputValue, isSending, myUserId, otherUserId]);

  // ── Cargar más (scroll hacia arriba) ──────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await loadConversation(page + 1, false);
  }, [hasMore, isLoading, loadConversation, page]);

  // ── Refresh completo ───────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    await loadConversation(1, true);
  }, [loadConversation]);

  return {
    messages,
    isLoading,
    isSending,
    hasMore,
    error,
    inputValue,
    setInputValue,
    sendMessage,
    loadMore,
    refresh,
  };
}

// Re-exportar tipo para uso externo
export type { UseInternalConversationOptions };
