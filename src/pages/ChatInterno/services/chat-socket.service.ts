import type { Socket } from 'socket.io-client';
import type { ChatMessage } from '../models/chat-message.interface';
import { buildChatKey } from '../helpers/chat.helpers';

type MessageHandler = (message: ChatMessage) => void;

/**
 * ChatSocketService
 *
 * Gestiona la suscripción al evento de Socket.IO "new-internal-message"
 * reutilizando el socket singleton ya conectado en el proyecto.
 *
 * Responsabilidad única: suscribir/desuscribir del canal de mensajes internos.
 */
class ChatSocketService {
  private socket: Socket | null = null;
  private handlers = new Map<string, Set<MessageHandler>>();

  /** Inyecta el socket singleton del proyecto (AuthContext). */
  setSocket(socket: Socket | null) {
    this.socket = socket;
  }

  /**
   * Suscribe a los mensajes de una conversación específica.
   * Filtra por chatKey para que solo lleguen los mensajes de ese par de usuarios.
   *
   * @returns función de limpieza para desuscribir
   */
  subscribeToConversation(
    myUserId: number,
    otherUserId: number,
    onMessage: MessageHandler,
  ): () => void {
    if (!this.socket) {
      console.warn('[ChatSocketService] Socket no disponible todavía.');
      return () => {};
    }

    const chatKey = buildChatKey(myUserId, otherUserId);

    // Registrar handler en el mapa interno
    if (!this.handlers.has(chatKey)) {
      this.handlers.set(chatKey, new Set());
    }
    this.handlers.get(chatKey)!.add(onMessage);

    // Listener general de socket que filtra por chatKey
    const listener = (message: ChatMessage) => {
      const incomingKey = buildChatKey(message.userOneId, message.userTwoId);
      if (incomingKey === chatKey) {
        this.handlers.get(chatKey)?.forEach((h) => h(message));
      }
    };

    // Guardar referencia para poder removerla después
    (onMessage as MessageHandler & { _socketListener?: typeof listener })
      ._socketListener = listener;

    this.socket.on('new-internal-message', listener);

    // Retornar cleanup
    return () => {
      this.socket?.off('new-internal-message', listener);
      this.handlers.get(chatKey)?.delete(onMessage);
      if (this.handlers.get(chatKey)?.size === 0) {
        this.handlers.delete(chatKey);
      }
    };
  }

  /**
   * Emite que el usuario está viendo una conversación
   * (útil para presencia/typing en el futuro).
   */
  joinInternalChat(myUserId: number, otherUserId: number) {
    const chatKey = buildChatKey(myUserId, otherUserId);
    this.socket?.emit('joinInternalChat', chatKey);
  }

  leaveInternalChat(myUserId: number, otherUserId: number) {
    const chatKey = buildChatKey(myUserId, otherUserId);
    this.socket?.emit('leaveInternalChat', chatKey);
  }
}

export const chatSocketService = new ChatSocketService();
export default chatSocketService;
