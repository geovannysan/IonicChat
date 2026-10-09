/**
 * ChatAttachmentPreview
 *
 * Muestra una vista previa de pantalla completa del archivo adjunto antes de enviarlo.
 * Soporta imágenes (preview visual) y archivos genéricos (icono + nombre).
 * Se monta mediante createPortal en document.body para superponerse a cualquier
 * layout de Ionic.
 *
 * Extraído de chat-bottombar.tsx (no-giant-component).
 */
import React, { useRef } from "react";
import { createPortal } from "react-dom";
import { FileText, SendHorizontal, Trash } from "lucide-react";
import { Button } from "../Button";

interface ChatAttachmentPreviewProps {
  file: File;
  previewUrl: string | null;
  message: string;
  isLoading: boolean;
  onMessageChange: (value: string) => void;
  onSend: () => void;
  onCancel: () => void;
}

export function ChatAttachmentPreview({
  file,
  previewUrl,
  message,
  isLoading,
  onMessageChange,
  onSend,
  onCancel,
}: Readonly<ChatAttachmentPreviewProps>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const content = (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/80 backdrop-blur-sm">
      <div className="flex justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-white bg-gray-800 hover:bg-gray-700"
          aria-label="Cancelar adjunto"
        >
          <Trash size={20} />
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview del archivo"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 p-8 bg-muted rounded-lg">
            <FileText className="h-24 w-24 text-muted-foreground" />
            <p className="text-lg font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}
      </div>

      <div className="p-4 flex items-center gap-4 bg-background/90 border-t">
        <textarea
          ref={textareaRef}
          rows={1}
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Añadir un comentario..."
          aria-label="Comentario del archivo adjunto"
          className="w-full resize-none border-none bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none"
        />
        <Button
          size="icon"
          className="h-12 w-12 shrink-0 rounded-full bg-primary text-primary-foreground"
          onClick={onSend}
          disabled={isLoading}
          aria-label="Enviar archivo"
        >
          <SendHorizontal />
        </Button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
