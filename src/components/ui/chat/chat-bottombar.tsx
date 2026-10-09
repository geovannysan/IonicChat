/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ChatBottombar — Orquestador de la barra inferior de chat.
 *
 * Responsabilidades:
 *  - Gestionar el estado de mensaje de texto, archivo adjunto y grabación de audio.
 *  - Coordinar el envío al backend via apiService.
 *  - Delegar la UI de cada modo a subcomponentes especializados:
 *      · ChatAttachmentPreview — preview de archivo antes de enviar.
 *      · ChatAudioRecorder     — controles de grabación/previsualización de audio.
 *
 * Refactorizado desde la versión monolítica (no-giant-component).
 * Object URLs: se liberan en cleanup de useEffect y en cada punto de sustitución
 * para evitar fugas de memoria (no-create-object-url-without-revoke).
 */
declare global {
  interface Window {
    WebAudioRecorder: any;
  }
}
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { base64ToFileAuto, cn } from "../../../lib/utils";
import { VoiceRecorder } from "capacitor-voice-recorder";
import { Mic, SendHorizontal, Upload } from "lucide-react";
import { apiService } from "../../../services/api";
import { IonInput } from "@ionic/react";
import { Button } from "../Button";
import { ChatAttachmentPreview } from "./ChatAttachmentPreview";
import { ChatAudioRecorder } from "./ChatAudioRecorder";

interface ChatBottombarProps {
  isMobile: boolean;
  selectedUser: any;
  user?: any | null;
}

export default function ChatBottombar({
  selectedUser,
  user,
}: Readonly<ChatBottombarProps>) {
  const [message, setMessage] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDisabled = !selectedUser || selectedUser.userId !== user?.id;

  const [isLoading, setIsLoading] = useState(false);
  const [pastedFile, setPastedFile] = useState<File | null>(null);
  const [pastedFilePreviewUrl, setPastedFilePreviewUrl] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // no-create-object-url-without-revoke: cada URL se revoca en el cleanup del
  // useEffect que lo observa. React ejecuta el cleanup con el valor ANTERIOR
  // cada vez que el estado cambia, y también en desmontaje — garantizando que
  // cada Blob/File se libera exactamente una vez.
  useEffect(() => {
    if (!audioUrl) return;
    return () => {
      URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!pastedFilePreviewUrl) return;
    return () => {
      URL.revokeObjectURL(pastedFilePreviewUrl);
    };
  }, [pastedFilePreviewUrl]);

  // Auto-resize del textarea al cambiar el mensaje.
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [message]);

  // ─── Grabación de audio ──────────────────────────────────────────────────────

  const startRecording = async () => {
    try {
      await VoiceRecorder.requestAudioRecordingPermission();
      await VoiceRecorder.startRecording();
      setIsRecording(true);
      setRecordingTime(0);
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone error", err);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await VoiceRecorder.stopRecording();
      if (intervalRef.current) clearInterval(intervalRef.current);

      if (result.value?.recordDataBase64) {
        const blob = base64ToFileAuto(result.value.recordDataBase64);
        // El useEffect([audioUrl]) revocará el URL anterior en su cleanup.
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
      }
      setIsRecording(false);
    } catch (err) {
      console.error("Error stopping recording", err);
      setIsRecording(false);
    }
  };

  const handleDiscardAudio = () => {
    // setAudioUrl(null) dispara el cleanup del useEffect([audioUrl]), que revoca la URL.
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  // ─── Reset de estado ─────────────────────────────────────────────────────────

  const resetInput = () => {
    setMessage("");
    setAudioBlob(null);
    // Los useEffect de cleanup revocarán audioUrl y pastedFilePreviewUrl
    // cuando el estado cambie a null.
    setAudioUrl(null);
    setRecordingTime(0);
    setPastedFile(null);
    setIsLoading(false);
    setPastedFilePreviewUrl(null);
  };

  // ─── Envío de mensajes ───────────────────────────────────────────────────────

  const handleSend = async () => {
    setIsLoading(true);
    try {
      if (pastedFile) {
        const reader = new FileReader();
        reader.readAsDataURL(pastedFile);
        reader.onloadend = async () => {
          const base64String = reader.result;
          const payload = {
            medias: base64String,
            fileName: pastedFile.name,
            body: message.trim(),
            ticketid: selectedUser.id.toString(),
            fromMe: "1",
            contactId: selectedUser.contactId.toString(),
          };
          await apiService.request("/api/v1/Chat", {
            method: "POST",
            data: payload,
            headers: { "Content-Type": "application/json" },
          });
          resetInput();
        };
      } else if (audioBlob) {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64String = reader.result;
          const payload = {
            medias: base64String,
            fileName: `audio-${Date.now()}.ogg`,
            body: message.trim(),
            ticketid: selectedUser.id.toString(),
            fromMe: "1",
            contactId: selectedUser.contactId.toString(),
          };
          await apiService.request("/api/v1/Chat", {
            method: "POST",
            data: payload,
            headers: { "Content-Type": "application/json" },
          });
          resetInput();
        };
      } else if (message.trim()) {
        await apiService.request("/Chat", {
          method: "POST",
          data: {
            ticketid: selectedUser.id.toString(),
            fromMe: true,
            body: message.trim(),
          },
        });
        resetInput();
      }
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  // ─── Manejo de archivos adjuntos ─────────────────────────────────────────────

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPastedFile(file);
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      // El useEffect([pastedFilePreviewUrl]) revocará el URL anterior en su cleanup.
      const url = URL.createObjectURL(file);
      setPastedFilePreviewUrl(url);
    } else {
      setPastedFilePreviewUrl(null);
    }
  };

  const cancelPreview = () => {
    setPastedFile(null);
    // setAudioUrl(null) dispara el cleanup del useEffect([pastedFilePreviewUrl]).
    setPastedFilePreviewUrl(null);
  };

  // ─── Drag & Drop ─────────────────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) =>
    e.preventDefault();
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setPastedFile(file);
    if (file.type.startsWith("image/")) {
      // El useEffect([pastedFilePreviewUrl]) revocará el URL anterior en su cleanup.
      const url = URL.createObjectURL(file);
      setPastedFilePreviewUrl(url);
    } else {
      setPastedFilePreviewUrl(null);
    }
  };


  // ─── Render ──────────────────────────────────────────────────────────────────

  // Modo preview de archivo adjunto: portal de pantalla completa.
  if (pastedFile) {
    return (
      <ChatAttachmentPreview
        file={pastedFile}
        previewUrl={pastedFilePreviewUrl}
        message={message}
        isLoading={isLoading}
        onMessageChange={setMessage}
        onSend={handleSend}
        onCancel={cancelPreview}
      />
    );
  }

  return (
    <>
      {/* Campo deshabilitado: se muestra cuando el chat no pertenece al usuario */}
      <div
        className="px-2 py-4 flex justify-between w-full items-end gap-2"
        style={{ display: isDisabled ? "" : "none" }}
      >
        <IonInput
          name="message"
          disabled={isDisabled}
          aria-label="Campo de mensaje (deshabilitado)"
          className={cn(
            "max-h-8 px-4 py-3 bg-background text-sm placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md flex items-center h-8 resize-none"
          )}
        />
      </div>

      {/* Campo activo: adjuntar, texto / grabación, botón de envío */}
      <div
        className="px-2 py-4 flex justify-between w-full items-center gap-2"
        style={{ display: isDisabled ? "none" : "" }}
      >
        {/* Botón de adjuntar archivo */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            aria-label="Adjuntar archivo"
            onChange={handleFileChange}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label="Adjuntar archivo"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={20} className="text-muted-foreground" />
          </Button>
        </div>

        {/* Área de entrada: texto o grabación de audio */}
        <LazyMotion features={domAnimation}>
          <AnimatePresence initial={false}>
            <m.div
              key="input"
              className={cn(
                "w-full relative",
                isDraggingOver &&
                  "outline-dashed outline-2 outline-primary rounded-lg"
              )}
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1 }}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Subcomponente de grabación de audio */}
              {(isRecording || audioBlob) ? (
                <ChatAudioRecorder
                  isRecording={isRecording}
                  recordingTime={recordingTime}
                  audioUrl={audioUrl}
                  audioBlob={audioBlob}
                  onStopRecording={stopRecording}
                  onDiscardAudio={handleDiscardAudio}
                />
              ) : (
                <div className="flex flex-col w-full rounded-lg border bg-background">
                  <IonInput
                    value={message}
                    onIonInput={(e) => setMessage(e.detail.value!)}
                    placeholder="Escribe un mensaje..."
                    aria-label="Escribe un mensaje"
                    className="w-full resize-none border-none bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              )}
            </m.div>

            {/* Botón de enviar (si hay contenido) o de iniciar grabación */}
            {message.trim() || audioBlob ? (
              <Button
                className="h-9 w-9 shrink-0"
                onClick={handleSend}
                disabled={isLoading || isDisabled}
                variant="ghost"
                size="icon"
                aria-label="Enviar mensaje"
              >
                <SendHorizontal size={22} className="text-muted-foreground" />
              </Button>
            ) : (
              <Button
                className="h-9 w-9 shrink-0"
                onClick={startRecording}
                disabled={isDisabled}
                variant="ghost"
                size="icon"
                aria-label="Iniciar grabación de voz"
              >
                <Mic size={22} className="text-muted-foreground" />
              </Button>
            )}
          </AnimatePresence>
        </LazyMotion>
      </div>
    </>
  );
}
