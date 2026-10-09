import * as React from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";

type MediaViewerDialogProps = {
  url: string;
  type: "image" | "video";
  children: React.ReactNode;
};

/**
 * shadcn-dialog-content-requires-title: DialogTitle es obligatorio para que los
 * lectores de pantalla anuncien el propósito del diálogo.
 * Se usa `sr-only` para ocultarlo visualmente sin afectar la accesibilidad.
 */
export const MediaViewerDialog: React.FC<MediaViewerDialogProps> = ({
  url,
  type,
  children,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-zoom-in">{children}</div>
      </DialogTrigger>
      <DialogContent className="p-0 max-w-[90vw] max-h-[90vh] overflow-hidden">
        {/* sr-only: visible para lectores de pantalla, oculto visualmente */}
        <DialogTitle className="sr-only">
          {type === "image" ? "Visualizador de imagen" : "Visualizador de video"}
        </DialogTitle>

        {type === "image" ? (
          <img
            src={url}
            alt="Vista previa del archivo"
            className="w-full h-auto object-contain max-h-[90vh] mx-auto"
          />
        ) : (
          <video
            controls
            autoPlay={false}
            className="w-full h-auto object-contain max-h-[90vh] mx-auto"
          >
            <source src={url} />
          </video>
        )}
      </DialogContent>
    </Dialog>
  );
};
