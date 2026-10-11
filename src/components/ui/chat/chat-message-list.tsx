/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { ArrowDown, LoaderCircle } from "lucide-react";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { Button } from "../Button";

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  loading: boolean;
  scrollRef?: React.RefObject<HTMLDivElement | null> | null;
  type?: string | number;
}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ className, children, onScroll, loading, scrollRef, type, ...props }, _ref) => {
    const { containerRef, isAtBottom, scrollToBottom } = useAutoScroll([children], scrollRef);

    const actualRef = scrollRef || containerRef;

    return (
      <div className="relative w-full h-full">
        {/* Spinner de carga de mensajes anteriores */}
        {loading && (
          <Button
            disabled
            size="icon"
            variant="outline"
            className="absolute top-2 left-1/2 -translate-x-1/2 z-10 rounded-full shadow-md bg-card/80 backdrop-blur-sm border-border"
            aria-label="Cargando mensajes"
          >
            <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
          </Button>
        )}

        {/* Área de scroll con fondo estilo WhatsApp */}
        <div
          className={[
            "flex flex-col w-full h-full overflow-y-auto px-3 py-4",
            // fondo sutil con patrón o color neutro según tema
            "bg-muted/20 dark:bg-background/60",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          ref={actualRef}
          onScroll={onScroll}
          {...props}
        >
          <div className="flex flex-col gap-1.5">
            {children}
          </div>
        </div>

        {/* Botón ir al fondo */}
        {!isAtBottom && (
          <Button
            onClick={scrollToBottom}
            size="icon"
            variant="secondary"
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 rounded-full shadow-lg border border-border/60 h-8 w-8"
            aria-label="Ir al fondo"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    );
  },
);

ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };
