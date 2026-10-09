import React from 'react';
import { Avatar } from '@radix-ui/react-avatar';
import { AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/Badge';
import SoftBadgeDemo from '@/components/ui/chat/Sidebar';
import { MessageCircleCode, UserRoundIcon } from 'lucide-react';
import { cn, formatWhatsAppDate } from '@/lib/utils';
import { ChatItem } from '@/stores/useTicketsChat';
import { Etiqueta } from '@/types';

interface ChatListItemProps {
  chat: ChatItem;
  currentUserId: number;
  onSelect: (chat: ChatItem) => void;
}

/**
 * Ítem de conversación en la lista de chats.
 * Extraído de ChatListPage para responsabilidad única.
 * La key estable (chat.id) se aplica desde el padre.
 */
export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  currentUserId,
  onSelect,
}) => (
  <div
    role="button"
    tabIndex={0}
    aria-label={`Abrir chat con ${chat?.Contact?.name ?? 'contacto'}`}
    onClick={() => onSelect(chat)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') onSelect(chat);
    }}
    className={cn(
      'w-full flex flex-col gap-1 p-3 transition-all cursor-pointer hover:bg-muted/30 border-b border-zinc-200 dark:border-zinc-700'
    )}
  >
    <div className="flex items-start gap-3">
      <div className="flex flex-col justify-between items-center gap-3 p-2">
        <Avatar className="flex justify-center items-center">
          <AvatarFallback className="bg-blue-500 text-white">
            <UserRoundIcon className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>

        {chat.userId != null && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Badge className="rounded-full">
                <span className="text-xs text-white font-medium">
                  {chat.userId === currentUserId ? 'MI' : 'AG'}
                </span>
              </Badge>
              <div
                className={cn(
                  'h-2.5 w-2.5 ring-2 ring-background rounded-full absolute bottom-0 right-0',
                  chat.userId === currentUserId ? 'bg-green-500' : 'bg-yellow-500'
                )}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col w-full gap-1" title={chat.lastMessage}>
        <div className="flex justify-between items-center">
          <Badge className="rounded-full align-center pl-[3px]" variant="secondary">
            {!chat?.ChatPerfil?.conexionID && (
              <MessageCircleCode height={20} width={20} />
            )}
            <div className="align-middle text-center font-medium">
              {chat?.ChatPerfil?.name || 'PaperLayer Channel'}
            </div>
          </Badge>

          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <span>{formatWhatsAppDate(chat.updatedAt) || '1h'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="font-semibold text-sm text-foreground">
            {chat?.Contact?.name || 'Sin nombre'}
          </span>

          <span
            className="text-muted-foreground truncate text-start text-sm"
            style={{ maxHeight: '50px', overflow: 'hidden' }}
          >
            {chat.lastMessage
              ? String(chat.lastMessage).substring(0, 37)
              : 'Sin mensajes'}
          </span>
        </div>
      </div>
    </div>

    <div className="flex gap-1 mt-2 flex-wrap w-full pl-18">
      <SoftBadgeDemo status={'' + chat.status} />
      {chat.Teams?.name && (
        <Badge className="rounded-full">
          <div
            className="h-1.5 w-1.5 rounded-full mr-2"
            style={{ backgroundColor: chat.Teams?.color }}
          />
          {chat.Teams?.name}
        </Badge>
      )}
      {chat.etiquetas && (
        <div className="flex items-center">
          {chat.etiquetas.slice(0, 3).map((tag: { id: number; name: string; color: string }) => (
            // key estable: usar tag.id en lugar de índice de array
            <Badge
              key={tag.id}
              className={cn(
                'text-white h-5 w-5',
                tag.color ? '' : 'bg-gray-400'
              )}
              style={tag.color ? { backgroundColor: tag.color } : {}}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);
