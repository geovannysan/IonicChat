import * as React from "react"; 
import { Dialog,  DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";

type MediaViewerDialogProps = {
  url: string;
  type: "image" | "video";
  children: React.ReactNode; // el preview (imagen pequeña)
};
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
      <DialogTitle></DialogTitle>
      <DialogContent className="p-0 max-w-[90vw] max-h-[90vh] overflow-hidden ">
        {type === "image" ? (
          <img
            src={url}
            alt="Vista previa"
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
