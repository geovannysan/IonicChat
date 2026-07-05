import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CommentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const CommentDialog = ({ isOpen, onOpenChange, children }: CommentDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      <Button variant="outline" className="gap-2">
        <MessageSquarePlus className="h-4 w-4" />
        Añadir Comentario
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[525px]">
      <DialogHeader>
        <DialogTitle>Nuevo comentario</DialogTitle>
      </DialogHeader>
      <div className="py-4">{children}</div>
    </DialogContent>
  </Dialog>
);
