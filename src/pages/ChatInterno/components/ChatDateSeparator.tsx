import React from 'react';
import { formatChatDate } from '../helpers/chat.helpers';

interface ChatDateSeparatorProps {
  isoDate: string;
}

/**
 * Separador visual entre grupos de mensajes de días distintos.
 */
export const ChatDateSeparator: React.FC<ChatDateSeparatorProps> = ({
  isoDate,
}) => {
  const label = formatChatDate(isoDate);

  return (
    <div className="flex items-center justify-center my-3 px-4">
      <div className="flex-1 h-px bg-border/50" />
      <span className="mx-3 text-[10px] text-muted-foreground font-medium bg-background px-2 py-0.5 rounded-full border border-border/40 shadow-sm">
        {label}
      </span>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  );
};
