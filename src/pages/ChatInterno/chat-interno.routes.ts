/**
 * chat-interno.routes.ts
 *
 * Define las rutas del módulo Chat Interno para usar en App.tsx.
 * Importar como:
 *   import { chatInternoRoutes } from '@/pages/ChatInterno/chat-interno.routes';
 */

export const CHAT_INTERNO_ROUTES = {
  /** Lista de usuarios con quienes chatear (tab raíz) */
  LIST: '/tabs/internal-chat',
  /** Conversación entre dos usuarios: /internal-chat/:myId/:otherId */
  CONVERSATION: '/internal-chat/:myId/:otherId',
  /** Helper para generar la ruta de conversación */
  conversationPath: (myId: number | string, otherId: number | string) =>
    `/internal-chat/${myId}/${otherId}`,
} as const;
