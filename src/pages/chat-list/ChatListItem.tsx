import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/Badge';
import SoftBadgeDemo from '@/components/ui/chat/Sidebar';
import { HandMetalIcon } from 'lucide-react';
import { cn, formatWhatsAppDate } from '@/lib/utils';
import { ChatItem } from '@/stores/useTicketsChat';

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
}) => {
  const isMine = chat.userId === currentUserId;
  const isOther = chat.userId != null && !isMine;
  const contactName = chat?.Contact?.name || 'Sin nombre';
  const initials = contactName.substring(0, 2).toUpperCase();

  return (
    <button
      type="button"
      aria-label={`Abrir chat con ${contactName}`}
      onClick={() => onSelect(chat)}
      className={cn(
        'w-full text-left relative flex gap-3 p-3 transition-colors duration-150',
        'border-b border-border/60 border-l-2 border-l-transparent',
        'hover:bg-muted/40 cursor-pointer'
      )}
    >
      {/* Avatar + badge MI/AG */}
      <div className="flex flex-col items-center gap-2 shrink-0">
        <Avatar className="w-10 h-10 border border-border shadow-sm">
          <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>

        {(isMine || isOther) && (
          <div className="relative">
            <Badge
              variant="outline"
              className="rounded-full h-5 px-1.5 text-[9px] font-semibold"
            >
              {isMine ? 'MI' : 'AG'}
            </Badge>
            <span
              className={cn(
                'absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-card',
                isMine ? 'bg-green-500' : 'bg-yellow-500'
              )}
            />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        {/* Canal + fecha */}
        <div className="flex items-center justify-between gap-1">
          <Badge
            variant="outline"
            className="rounded-full pl-1 pr-2 py-0 h-5 gap-1 text-[10px] font-medium"
          >
            {!chat?.ChatPerfil?.conexionID && (
              <HandMetalIcon className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            <span className="truncate max-w-[90px] text-muted-foreground">
              {chat?.ChatPerfil?.name || 'PaperLayer'}
            </span>
          </Badge>

          <span className="text-[10px] text-muted-foreground shrink-0">
            {formatWhatsAppDate(chat.updatedAt) || '1h'}
          </span>
        </div>

        {/* Nombre */}
        <p className="text-sm font-semibold truncate text-foreground">
          {contactName}
        </p>

        {/* Último mensaje */}
        <p className="text-xs truncate text-muted-foreground leading-normal">
          {chat.lastMessage
            ? String(chat.lastMessage).substring(0, 55)
            : 'Sin mensajes'}
        </p>

        {/* Estado + equipo + etiquetas */}
        <div className="flex items-center gap-1 mt-1 flex-wrap">
          <SoftBadgeDemo status={String(chat.status)} />

          {chat.Teams?.name && (
            <Badge
              variant="outline"
              className="rounded-full h-5 px-1.5 text-[9px] font-medium gap-1"
            >
              {chat.Teams.color && (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: chat.Teams.color }}
                />
              )}
              {chat.Teams.name}
            </Badge>
          )}

          {chat.etiquetas && chat.etiquetas.length > 0 && (
            <div className="flex items-center gap-0.5">
              {chat.etiquetas.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  title={tag.name}
                  className="w-3.5 h-3.5 rounded-full border border-card shadow-sm shrink-0"
                  style={{ backgroundColor: tag.color || '#9ca3af' }}
                />
              ))}
            </div>
          )}

          {chat.unreadMessages > 0 && (
            <span className="ml-auto inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold shrink-0">
              {chat.unreadMessages}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
