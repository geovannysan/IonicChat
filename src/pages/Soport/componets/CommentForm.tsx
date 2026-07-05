import { useRef, useState } from "react";
import { Paperclip, Trash2, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IonTextarea, IonToast } from "@ionic/react";
import apiService from "@/services/api";

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
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; color: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const toBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const handleSubmit = async () => {
    if (!message.trim() && !file) return;
    setLoading(true);

    try {
          /** 
       * campos que se envian al endpoint de comentarios, actualmente el endpoint solo recibe el mensaje pero se pueden agregar los otros campos para enviar archivos adjuntos y asociarlos al comentario
       * authorId
: 
1
authorType
: 
"user"
createdAt
: 
"2026-05-31T22:54:43.767Z"
id
: 
14
message
: 
",,"
soporteTicketId
: 
"9"
       */
  
      const payload: CommentPayload = { soporteTicketId: ticketId, message: message.trim(), token: slug, authorType: "user",
        
      };

      if (file) {
        payload.medias = await toBase64(file);
        payload.fileName = file.name;
      }
      await apiService.request("/api/v1/agenda/coment", {
        method: "POST",
        data: payload,
      });

      setToastMsg({ text: "Comentario enviado", color: "success" });
      onClose();
    } catch {
      setToastMsg({ text: "Error al enviar el comentario", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border bg-background p-3">
        <IonTextarea
          value={message}
          onIonInput={(e) => setMessage(e.detail.value ?? "")}
          placeholder="Escribe tu comentario..."
          rows={4}
          className="w-full resize-none border-none bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none"
        />
      </div>

      {file && (
        <div className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
          <span className="truncate text-muted-foreground">{file.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => {
              setFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => fileInputRef.current?.click()}
          title="Adjuntar archivo"
        >
          <Paperclip className="h-4 w-4 text-muted-foreground" />
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={loading || (!message.trim() && !file)}
          className="gap-2"
        >
          <SendHorizontal className="h-4 w-4" />
          {loading ? "Enviando..." : "Enviar"}
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
