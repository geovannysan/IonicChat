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
    <div className="px-3 py-2.5">
      {/* Campo deshabilitado */}
      {isDisabled && (
        <div className="flex items-center justify-center px-4 py-2.5 rounded-2xl bg-muted/60 border border-border">
          <span className="text-xs text-muted-foreground select-none">
            Solo el agente asignado puede responder
          </span>
        </div>
      )}

      {/* Campo activo */}
      {!isDisabled && (
        <div
          className={cn(
            "flex items-end gap-2 px-3 py-2 rounded-2xl border bg-card transition-colors duration-200",
            isDraggingOver
              ? "border-primary ring-2 ring-primary/20 bg-primary/5"
              : "border-border hover:border-muted-foreground/40"
          )}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Botón adjuntar */}
          <div className="flex items-center pb-1 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              aria-label="Adjuntar archivo"
              onChange={handleFileChange}
            />
            <button
              type="button"
              aria-label="Adjuntar archivo"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <Upload size={16} />
            </button>
          </div>

          {/* Área de entrada o grabación */}
          <div className="flex-1 min-w-0">
            <LazyMotion features={domAnimation}>
              <AnimatePresence initial={false}>
                <m.div
                  key="input"
                  className="w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
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
                    <IonInput
                      value={message}
                      onIonInput={(e) => setMessage(e.detail.value!)}
                      placeholder="Escribe un mensaje..."
                      aria-label="Escribe un mensaje"
                      className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 py-1.5"
                    />
                  )}
                </m.div>
              </AnimatePresence>
            </LazyMotion>
          </div>

          {/* Botón enviar o micrófono */}
          <div className="pb-1 shrink-0">
            <LazyMotion features={domAnimation}>
              <AnimatePresence mode="wait" initial={false}>
                {message.trim() || audioBlob ? (
                  <m.button
                    key="send"
                    type="button"
                    aria-label="Enviar mensaje"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.12 }}
                    onClick={handleSend}
                    disabled={isLoading}
                    className="h-9 w-9 rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    <SendHorizontal size={16} className="translate-x-px" />
                  </m.button>
                ) : (
                  <m.button
                    key="mic"
                    type="button"
                    aria-label="Iniciar grabación de voz"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.12 }}
                    onClick={startRecording}
                    className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer active:scale-95"
                  >
                    <Mic size={16} />
                  </m.button>
                )}
              </AnimatePresence>
            </LazyMotion>
          </div>
        </div>
      )}
    </div>
  );
}
