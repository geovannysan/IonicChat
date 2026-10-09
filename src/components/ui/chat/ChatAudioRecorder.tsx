/**
 * ChatAudioRecorder
 *
 * Muestra los controles de grabación de voz y la previsualización del audio grabado.
 * Gestiona el temporizador de grabación y expone callbacks para detener/descartar.
 *
 * Extraído de chat-bottombar.tsx (no-giant-component).
 */
import React from "react";
import { StopCircle, Trash } from "lucide-react";
import { Button } from "../Button";

interface ChatAudioRecorderProps {
  /** true mientras la grabación está en curso */
  isRecording: boolean;
  /** Segundos transcurridos desde que inició la grabación */
  recordingTime: number;
  /** URL del blob de audio ya grabado (null si aún grabando o si no hay grabación) */
  audioUrl: string | null;
  /** Blob del audio grabado (null si aún grabando) */
  audioBlob: Blob | null;
  onStopRecording: () => void;
  onDiscardAudio: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function ChatAudioRecorder({
  isRecording,
  recordingTime,
  audioUrl,
  audioBlob,
  onStopRecording,
  onDiscardAudio,
}: Readonly<ChatAudioRecorderProps>) {
  if (isRecording) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 w-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={onStopRecording}
          className="h-9 w-9 shrink-0 text-red-500 animate-pulse"
          aria-label="Detener grabación"
        >
          <StopCircle size={22} />
        </Button>
        <span className="text-sm font-medium text-red-600">
          {formatTime(recordingTime)}
        </span>
      </div>
    );
  }

  if (audioBlob && audioUrl) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 w-full">
        <audio src={audioUrl} controls className="max-w-[120px] h-8" />
        <Button
          onClick={onDiscardAudio}
          className="h-9 w-9 shrink-0 text-muted-foreground hover:text-red-500"
          variant="ghost"
          size="icon"
          aria-label="Borrar grabación"
          title="Borrar grabación"
        >
          <Trash />
        </Button>
      </div>
    );
  }

  return null;
}
