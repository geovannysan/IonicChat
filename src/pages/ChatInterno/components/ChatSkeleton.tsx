import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonBubbleProps {
  isMine?: boolean;
}

const SkeletonBubble: React.FC<SkeletonBubbleProps> = ({ isMine = false }) => (
  <div
    className={cn(
      'flex items-end gap-2 px-3 py-1',
      isMine ? 'flex-row-reverse' : 'flex-row',
    )}
  >
    {!isMine && (
      <div className="w-7 h-7 rounded-full bg-muted animate-pulse shrink-0" />
    )}
    <div
      className={cn(
        'rounded-2xl h-9 bg-muted animate-pulse',
        isMine ? 'w-40' : 'w-52',
      )}
    />
  </div>
);

/**
 * Skeleton de carga para la pantalla de conversación.
 * Simula burbujas alternas mientras se carga el historial.
 */
export const ConversationSkeleton: React.FC = () => (
  <div className="flex flex-col gap-1 pt-4">
    <SkeletonBubble isMine={false} />
    <SkeletonBubble isMine />
    <SkeletonBubble isMine={false} />
    <SkeletonBubble isMine />
    <SkeletonBubble isMine={false} />
    <SkeletonBubble isMine />
  </div>
);

/**
 * Skeleton para el item de usuario en la lista.
 */
export const UserListSkeleton: React.FC = () => (
  <div className="flex flex-col divide-y divide-border/50">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 rounded-full bg-muted animate-pulse shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 bg-muted animate-pulse rounded-full w-32" />
          <div className="h-2.5 bg-muted animate-pulse rounded-full w-48" />
        </div>
      </div>
    ))}
  </div>
);
