/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    WebAudioRecorder: any;
  }
}
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { base64ToFileAuto, cn } from "../../../lib/utils";
import {
  FileImage,
  Mic,

  SendHorizontal,
  StopCircle,
  FileText,
  Upload,
  Trash,
} from "lucide-react";
import { apiService } from "../../../services/api";

import { IonIcon, IonInput } from "@ionic/react";
import { Button, buttonVariants } from "../Button";
import { MediaPreview } from "../Mediapreview";

interface ChatBottombarProps {
  isMobile: boolean;
  selectedUser: any;
  user?: any | null;
}

// eslint-disable-next-line react-refresh/only-export-components
export const BottombarIcons = [{ icon: FileImage }];
//isMobile = false,
export default function ChatBottombar({ selectedUser, user }: Readonly<ChatBottombarProps>) {
  const [message, setMessage] = useState("");

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<any | null>(null);
  const mediaStreamRef = useRef<any | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDisabled = !selectedUser || selectedUser.userId !== user?.id;

  const [isLoading, setIsLoading] = useState(false);
  //const [showPopover, setShowPopover] = useState(false)
  const [pastedFile, setPastedFile] = useState<File | null>(null);
  const [pastedFilePreviewUrl, setPastedFilePreviewUrl] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  



  const startRecording = async () => {
    setIsRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const input = audioContext.createMediaStreamSource(stream);

      const recorder = new (window as any).WebAudioRecorder(input, {
        workerDir: "/",
        encoding: "ogg",
        numChannels: 1,
        onEncoderLoading: () => ("Cargando encoder..."),
        onEncoderLoaded: () => ("Encoder cargado"),
      });

      recorder.setOptions({
        timeLimit: 120,
        encodeAfterRecord: true,
        ogg: { quality: 0.5 },
      });

      recorder.onComplete = (_rec: any, blob: Blob) => {
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setIsRecording(false);
      };

      recorder.startRecording();
      mediaRecorderRef.current = recorder;

      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone error", err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.finishRecording) {
      mediaRecorderRef.current.finishRecording();
    }

    setIsRecording(false);

    if (intervalRef.current) clearInterval(intervalRef.current);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track: any) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const resetInput = () => {
    setMessage("");
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setPastedFile(null);
    setIsLoading(false);
    if (pastedFilePreviewUrl) {
      URL.revokeObjectURL(pastedFilePreviewUrl);
      setPastedFilePreviewUrl(null);
    }

  };

  const handleSend = async () => {
    setIsLoading(true);
    try {
      if (pastedFile) {
        const formData = new FormData();
        formData.append("medias", pastedFile, pastedFile.name);
        formData.append("body", message.trim());
        formData.append("ticketid", selectedUser.id.toString());
        formData.append("fromMe", "1");
        formData.append("contactId", selectedUser.contactId.toString());

        await apiService.request("/Chat", {
          method: 'POST',
          data: formData,
          headers: { "Content-Type": "multipart/form-data" }
        });
        resetInput();
      } else if (audioBlob) {
        const formData = new FormData();
        formData.append("medias", new File([audioBlob], "audio.ogg", { type: "audio/ogg" }));
        formData.append("body", '');
        formData.append("ticketid", selectedUser.id.toString());
        formData.append("fromMe", "1");
        formData.append("contactId", selectedUser.contactId.toString());

         apiService.request("/Chat", {
          method: 'POST',
          data: formData,
          headers: { "Content-Type": "multipart/form-data" }
        }).then(() => {
        }
        ).catch((error) => {
          console.error("Error sending audio message", error);
        });

        resetInput();
      } else if (message.trim()) {
        const info = {
          ticketid: selectedUser.id.toString(),
          fromMe: true,
          body: message.trim(),

        };
        await apiService.request("/Chat", {
          method: 'POST',
          data: info,
        });

       resetInput();
      }
    } catch (error) {
     
      console.error("Error sending message", error);
      return
    } finally {

    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPastedFile(file);
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        const url = URL.createObjectURL(file);
        setPastedFilePreviewUrl(url);
      } else {
        setPastedFilePreviewUrl(null);
      }
    }
  };

  

  const cancelPreview = () => {
    setPastedFile(null);
    if (pastedFilePreviewUrl) {
      URL.revokeObjectURL(pastedFilePreviewUrl);
      setPastedFilePreviewUrl(null);
    }
  };

 

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {


    if (isLoading || isDisabled) {
      event.preventDefault();
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

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
    if (file) {
      setPastedFile(file);
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPastedFilePreviewUrl(url);
      }
    }
  };

  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [message]);

  if (pastedFile) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background/80 backdrop-blur-sm">
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={cancelPreview}
            className="text-white bg-gray-800 hover:bg-gray-700"
          >
            <Trash size={20} />
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          {pastedFilePreviewUrl ? (
            <img
              src={pastedFilePreviewUrl}
              alt="Preview"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 p-8 bg-muted rounded-lg">
              <FileText className="h-24 w-24 text-muted-foreground" />
              <p className="text-lg font-medium">{pastedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(pastedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>

        <div className="p-4 flex items-center gap-4 bg-background/90 border-t">
          <textarea
            ref={inputRef}
            rows={1}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Añadir un comentario..."
            className="w-full resize-none border-none bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none"
          />
          <Button
            size="icon"
            className="h-12 w-12 shrink-0 rounded-full bg-primary text-primary-foreground"
            onClick={handleSend}
            disabled={isLoading}
          >
            <SendHorizontal />
          </Button>
        </div>
      </div>
    );
  }


  return (
    <>
      <div className="px-2 py-4 flex justify-between w-full items-end gap-2"
        style={{
          display: isDisabled ? "" : "none"
        }}
      >
        <IonInput
          name="message"
          disabled={isDisabled}
          className={cn(
            "max-h-8 px-4 py-3 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md flex items-center h-8 resize-none",

          )}
        />
      </div>
      <div className="px-2 py-4 flex justify-between w-full items-center gap-2"
        style={{
          display: isDisabled ? "none" : ""
        }}
      >

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={20} className="text-muted-foreground" />
          </Button>
        </div>

        <AnimatePresence initial={false}>
          <motion.div
            key="input"
            className={cn(
              "w-full relative",
              isDraggingOver && "outline-dashed outline-2 outline-primary rounded-lg"
            )}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isRecording ? (
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 w-full">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={stopRecording}
                  className="h-9 w-9 shrink-0 text-red-500 animate-pulse"
                >
                  <StopCircle size={22} />
                </Button>
                <span className="text-sm font-medium text-red-600">{formatTime(recordingTime)}</span>
              </div>
            ) : audioBlob && audioUrl ? (
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 w-full">
                <audio src={audioUrl} controls className="max-w-[120px] h-8" />
                <Button
                  onClick={() => {
                    setAudioBlob(null);
                    setAudioUrl(null);
                    setRecordingTime(0);
                  }}
                  className="h-9 w-9 shrink-0 text-muted-foreground hover:text-red-500"
                  variant="ghost"
                  size="icon"
                  title="Borrar grabación"
                >
                  <Trash />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col w-full rounded-lg border bg-background">
                <IonInput
                  value={message}
                  onIonInput={(e) => setMessage(e.detail.value!)}

                  placeholder={"Escribe un mensaje..."}
                  className="w-full resize-none border-none bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            )}
          </motion.div>

          {message.trim() || audioBlob ? (
            <Button
              className="h-9 w-9 shrink-0"
              onClick={handleSend}
              disabled={isLoading || isDisabled}
              variant="ghost"
              size="icon"
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
            >
              <Mic size={22} className="text-muted-foreground" />
            </Button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

