import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getInitials } from '../helpers/chat.helpers';
import type { ChatInternalUser } from '../models/chat-message.interface';

interface InternalUserItemProps {
  user: ChatInternalUser;
  onSelect: (user: ChatInternalUser) => void;
}

/**
 * Item de usuario en la lista de chat interno.
 * Al pulsarlo navega a la conversación con ese usuario.
 */
export const InternalUserItem: React.FC<InternalUserItemProps> = ({
  user,
  onSelect,
}) => {
  const initials = getInitials(user.name);

  return (
    <button
      type="button"
      aria-label={`Chatear con ${user.name}`}
      onClick={() => onSelect(user)}
      className={cn(
        'w-full text-left flex items-center gap-3 px-4 py-3',
        'border-b border-border/50 transition-colors duration-150',
        'hover:bg-muted/40 active:bg-muted/60 cursor-pointer',
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar className="w-10 h-10 border border-border shadow-sm">

          <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">
            {initials}
          </AvatarFallback>

        </Avatar>
        {/* Indicador de presencia (verde = online, visual estático) */}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-card" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {user.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        {user.lastMessage && (
          <p className="text-xs text-muted-foreground truncate mt-0.5 italic">
            {user.lastMessage.substring(0, 50)}
          </p>
        )}
      </div>

      {/* Badge de no leídos */}
      {user.unread != null && user.unread > 0 && (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
          {user.unread > 99 ? '99+' : user.unread}
        </span>
      )}
    </button>
  );
};
