import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatChatTime, getInitials } from '../helpers/chat.helpers';
import type { ChatMessage } from '../models/chat-message.interface';

interface ChatBubbleProps {
  message: ChatMessage;
  isMine: boolean;
}

/**
 * Burbuja individual de mensaje en la conversación interna.
 * - Mensajes propios: alineados a la derecha, color primary.
 * - Mensajes ajenos: alineados a la izquierda, con avatar y nombre.
 */
export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isMine }) => {
  const initials = getInitials(message.user?.name ?? '?');
  const time = formatChatTime(message.createdAt);

  return (
    <div
      className={cn(
        'flex items-end gap-2 px-3 py-1',
        isMine ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Avatar sólo para mensajes ajenos */}
      {!isMine && (
        <Avatar className="w-7 h-7 shrink-0 self-end">
          {message.user?.profile ? (
            <img
              src={message.user.profile}
              alt={message.user.name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
      )}

      {/* Burbuja */}
      <div
        className={cn(
          'max-w-[75%] flex flex-col',
          isMine ? 'items-end' : 'items-start',
        )}
      >
        {/* Nombre en mensajes ajenos */}
        {!isMine && (
          <span className="text-[10px] text-muted-foreground mb-0.5 ml-1">
            {message.user?.name}
          </span>
        )}

        <div
          className={cn(
            'rounded-2xl px-3 py-2 text-sm leading-snug break-words shadow-sm',
            isMine
              ? 'rounded-br-sm bg-primary text-primary-foreground'
              : 'rounded-bl-sm bg-card text-foreground border border-border/60',
          )}
        >
          {message.content}
        </div>

        {/* Hora */}
        <span className="text-[9px] text-muted-foreground mt-0.5 px-1">
          {time}
        </span>
      </div>
    </div>
  );
};
