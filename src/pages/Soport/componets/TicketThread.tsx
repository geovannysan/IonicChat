import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileIcon, User2, MessageSquare } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { SoporteComentario, SoporteTicket } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { MediaPreview } from '@/components/ui/Mediapreview';
import { cn } from '@/lib/utils';

export const TicketThread = ({ ticket }: { ticket: SoporteTicket }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al fondo cuando llegan nuevos mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket.mensajes]);

  const sorted = [...(ticket.mensajes ?? [])].sort(
    (a: SoporteComentario, b: SoporteComentario) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground px-4">
        <MessageSquare className="h-8 w-8 mb-3 opacity-20" />
        <p className="text-sm font-medium">Sin actividad todavía</p>
        <p className="text-xs mt-1 text-center opacity-70">
          Usa el botón "Añadir Comentario" para iniciar el hilo
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 flex flex-col gap-3">
      {sorted.map((comment: SoporteComentario, index: number) => {
        const isAgent = comment.authorType === 'user';
        const isLast  = index === sorted.length - 1;

        return (
          <div key={comment.id} className="relative flex gap-3">
            {/* Línea de tiempo */}
            {!isLast && (
              <span
                className="absolute left-3.5 top-8 bottom-0 w-px bg-border"
                aria-hidden="true"
              />
            )}

            {/* Avatar */}
            <Avatar
              className={cn(
                'h-7 w-7 shrink-0 border',
                isAgent ? 'border-primary/30' : 'border-border'
              )}
            >
              <AvatarFallback
                className={cn(
                  'text-[11px]',
                  isAgent
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <User2 className="h-3.5 w-3.5" />
              </AvatarFallback>
            </Avatar>

            {/* Contenido del comentario */}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              {/* Autor + fecha */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-foreground">
                    {isAgent
                      ? comment.user?.name || 'Agente'
                      : ticket.requesterName}
                  </span>
                  <Badge
                    variant={isAgent ? 'default' : 'secondary'}
                    className="text-[9px] px-1.5 h-4 uppercase tracking-wider"
                  >
                    {isAgent ? 'Soporte' : 'Cliente'}
                  </Badge>
                </div>
                <time className="text-[10px] text-muted-foreground shrink-0">
                  {format(new Date(comment.createdAt), "d MMM, HH:mm", { locale: es })}
                </time>
              </div>

              {/* Burbuja */}
              <div
                className={cn(
                  'text-sm leading-relaxed px-3.5 py-2.5 rounded-2xl border shadow-sm',
                  isAgent
                    ? 'bg-primary/8 border-primary/20 text-foreground rounded-tl-sm'
                    : 'bg-card border-border text-foreground rounded-tl-sm'
                )}
              >
                {comment.message}

                {/* Adjuntos */}
                {comment.adjuntos && comment.adjuntos.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-dashed border-border/60">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase mb-2">
                      <FileIcon className="h-3 w-3" />
                      Archivos adjuntos
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {comment.adjuntos.map((ele) => (
                        <div key={ele.id}>
                          <MediaPreview
                            type={String(ele.mimeType).split('/')[0]}
                            url={ele.fileUrl}
                            body=""
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Ancla de auto-scroll */}
      <div ref={bottomRef} />
    </div>
  );
};
