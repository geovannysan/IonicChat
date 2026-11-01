// ─── Modelos del módulo Chat Interno ────────────────────────────────────────

/** Usuario que envió el mensaje */
export interface ChatMessageUser {
  id: number;
  name: string;
  email: string;
  profile: string; // URL del avatar
}

/**
 * Mensaje individual de una conversación interna.
 * La clave chatperfliid sigue el patrón "min_max" (ej: "3_7")
 */
export interface ChatMessage {
  id: number;
  chatperfliid: string; // clave normalizada "min_max"
  userOneId: number;
  userTwoId: number;
  userId: number; // quien envió el mensaje
  content: string;
  createdAt: string; // ISO date
  user: ChatMessageUser;
}

/** Respuesta paginada del endpoint GET /api/chat-messages/:u1/:u2?page=N */
export interface ChatConversationResponse {
  messages: ChatMessage[];
  count: number;
  hasMore: boolean;
}

/**
 * Entrada de usuario para la lista de conversaciones.
 * Representación mínima de un usuario con quien chatear.
 */
export interface ChatInternalUser {
  id: number;
  name: string;
  email: string;
  profile: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unread?: number;
}
