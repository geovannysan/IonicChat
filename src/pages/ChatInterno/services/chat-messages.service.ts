import apiClient from '@/services/apiClient';
import type {
  ChatConversationResponse,
  ChatMessage,
} from '../models/chat-message.interface';
import { buildChatKey } from '../helpers/chat.helpers';

/**
 * ChatMessagesService
 *
 * Servicio con responsabilidad única: comunicarse con
 * el endpoint /api/chat-messages usando el apiClient ya
 * configurado (interceptor JWT incluido).
 */
class ChatMessagesService {
  private readonly base = '/chat-messages';

  /**
   * Obtiene la conversación paginada entre dos usuarios.
   * Los IDs se pasan en cualquier orden; el backend los normaliza.
   */
  async getConversation(
    userOneId: number,
    userTwoId: number,
    page = 1,
  ): Promise<ChatConversationResponse> {
    const { data } = await apiClient.get<ChatConversationResponse>(
      `${this.base}/${userOneId}/${userTwoId}`,
      { params: { page } },
    );
    return data;
  }

  /**
   * Envía un mensaje nuevo entre dos usuarios.
   */
  async sendMessage(
    userOneId: number,
    userTwoId: number,
    content: string,
  ): Promise<ChatMessage> {
    const { data } = await apiClient.post<ChatMessage>(
      `${this.base}/${userOneId}/${userTwoId}`,
      { content },
    );
    return data;
  }

  /**
   * Marca la conversación como leída.
   * Si el endpoint aún no existe en el backend, esta llamada
   * simplemente falla en silencio para no romper la UI.
   */
  // async markAsRead(userOneId: number, userTwoId: number): Promise<void> {
  //   try {
  //     await apiClient.put(`${this.base}/${userOneId}/${userTwoId}/read`);
  //   } catch {
  //     // No crítico: el endpoint puede no existir todavía
  //   }
  // }

  /**
   * Obtiene la lista de usuarios disponibles para chatear.
   * Usa el endpoint de usuarios existente del proyecto.
   */
  async getUsers(page = 1): Promise<{ users: Array<{ id: number; name: string; email: string; profile: string }> }> {
    const { data } = await apiClient.get< {hasMore: boolean, user: Array<{ id: number; name: string; email: string; profile: string }>}>(`/Users/list/${page}`);
    if(data.user === null && data.user === undefined  ) return { users: [] };
    return { users: data.user };
  }

  /**
   * Helper estático: normaliza la clave de conversación.
   * Re-exportado aquí para conveniencia del consumidor.
   */
  static buildChatKey = buildChatKey;
}

export const chatMessagesService = new ChatMessagesService();
export default chatMessagesService;
