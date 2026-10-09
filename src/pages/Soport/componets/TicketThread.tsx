import { CardContent } from "@/components/ui/Card";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FileIcon, User2,  MessageSquare } from "lucide-react";
import { useEffect, useRef } from "react";
import { SoporteComentario, SoporteTicket } from "@/types";
import { IonInfiniteScroll } from "@ionic/react";
import { Badge } from "@/components/ui/Badge";
import { MediaPreview } from "@/components/ui/Mediapreview";

export const TicketThread = ({ ticket }: { ticket: SoporteTicket }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Truco: Auto-scroll al final cuando llegan nuevos mensajes
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [ticket.mensajes]);
    return (
        <CardContent className="space-y-2 pt-6">
            <IonInfiniteScroll className="flex-1 p-2">
                <div className="space-y-4">
                    {ticket.mensajes?.length > 0 ? (
                        // sort inmutable: spread crea una copia antes de ordenar
                        [...ticket.mensajes]
                          .sort((a: SoporteComentario, b: SoporteComentario) =>
                            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                          )
                          .map((comment: SoporteComentario, index: number) => {
                            const isAgent = comment.authorType === "user";

                            return (
                                <div key={comment.id} className="relative">
                                    {/* Línea de tiempo (conector visual) */}
                                    {index !== ticket.mensajes.length - 1 && (
                                        <span className="absolute left-3 top-10 -bottom-10 w-0.5 bg-muted" aria-hidden="true" />
                                    )}

                                    <div className="flex gap-4 relative">
                                        {/* Avatar dinámico */}
                                        <Avatar className={`h-7 w-7 border ${isAgent ? 'border-blue-200' : 'border-slate-200'}`}>
                                      
                                                <AvatarFallback className="bg-slate-100 text-slate-600">
                                                    <User2 className="h-3 w-3" />
                                                </AvatarFallback>
                                            
                                        </Avatar>

                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-foreground">
                                                        {isAgent ? comment.user?.name || "Agente" : ticket.requesterName}
                                                    </span>
                                                    <Badge variant={isAgent ? "default" : "secondary"} className="text-[10px] px-1.5 h-4 uppercase tracking-wider">
                                                        {isAgent ? "Soporte" : "Cliente"}
                                                    </Badge>
                                                </div>
                                                <time className="text-sm text-muted-foreground">
                                                    {format(new Date(comment.createdAt), "d 'de' MMMM, HH:mm", { locale: es })}
                                                </time>
                                            </div>

                                            {/* Burbuja de mensaje */}
                                            <div className={`text-sm leading-relaxed p-4 rounded-2xl shadow-sm border ${isAgent
                                                ? 'bg-blue-50/50 border-blue-100 rounded-tl-none text-slate-800'
                                                : 'bg-white border-slate-200 rounded-tl-none text-slate-700'
                                                }`}>
                                                {comment.message}

                                                {/* Sección de Adjuntos */}
                                                {comment.adjuntos && comment.adjuntos.length > 0 && (
                                                    <div className="mt-4 pt-3 border-t border-dashed border-slate-300">
                                                        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase mb-2">
                                                            <FileIcon className="h-3.5 w-3.5" />
                                                            Archivos adjuntos
                                                        </p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                            {comment.adjuntos.map((ele) => (
                                                                <div key={ele.id} className="group">
                                                                    <MediaPreview
                                                                        type={String(ele.mimeType).split("/")[0]}
                                                                        url={ele.fileUrl}
                                                                        body=''
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No hay actividad en este ticket todavía.</p>
                        </div>
                    )}
                </div>
            </IonInfiniteScroll>
        </CardContent>
    );
};