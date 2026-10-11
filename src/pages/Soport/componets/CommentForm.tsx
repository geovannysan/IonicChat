import { useRef, useState } from 'react';
import { Paperclip, Trash2, SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IonTextarea, IonToast } from '@ionic/react';
import apiService from '@/services/api';

interface CommentPayload {
  soporteTicketId: string;
  message: string;
  medias?: string;
  fileName?: string;
  token?: string;
  authorType?: string;
}

interface CommentFormProps {
  ticketId: string;
  onClose: () => void;
  slug?: string;
}

export const CommentForm = ({ ticketId, onClose, slug }: CommentFormProps) => {
  const [message, setMessage]   = useState('');
  const [file, setFile]         = useState<File | null>(null);
  const [loading, setLoading]   = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; color: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const toBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onloadend  = () => resolve(reader.result as string);
      reader.onerror    = reject;
    });

  const handleSubmit = async () => {
    if (!message.trim() && !file) return;
    setLoading(true);
    try {
      const payload: CommentPayload = {
        soporteTicketId: ticketId,
        message: message.trim(),
        token: slug,
        authorType: 'user',
      };
      if (file) {
        payload.medias   = await toBase64(file);
        payload.fileName = file.name;
      }
      await apiService.request('/api/v1/agenda/coment', {
        method: 'POST',
        data: payload,
      });
      setToastMsg({ text: 'Comentario enviado', color: 'success' });
      onClose();
    } catch {
      setToastMsg({ text: 'Error al enviar el comentario', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Área de texto */}
      <div className="rounded-xl border border-border bg-background">
        <IonTextarea
          value={message}
          onIonInput={(e) => setMessage(e.detail.value ?? '')}
          placeholder="Escribe tu comentario..."
          rows={4}
          autoGrow
          className="w-full px-3 py-2 resize-none border-none bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none"
        />
      </div>

      {/* Archivo adjunto */}
      {file && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
          <span className="truncate text-muted-foreground">{file.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 ml-2"
            onClick={() => {
              setFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      )}

      {/* Acciones */}
      <div className="flex items-center justify-between">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Adjuntar archivo"
          className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
        >
          <Paperclip className="h-4 w-4" />
        </button>

        <Button
          onClick={handleSubmit}
          disabled={loading || (!message.trim() && !file)}
          className="gap-2 rounded-xl"
        >
          <SendHorizontal className="h-4 w-4" />
          {loading ? 'Enviando...' : 'Enviar'}
        </Button>
      </div>

      <IonToast
        isOpen={!!toastMsg}
        message={toastMsg?.text}
        color={toastMsg?.color}
        duration={3000}
        onDidDismiss={() => setToastMsg(null)}
      />
    </div>
  );
};
