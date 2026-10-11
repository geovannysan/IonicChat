import { cva, type VariantProps } from "class-variance-authority";

export const chatBubbleVariant = cva(
  "flex gap-2 max-w-[75%] items-end relative group",
  {
    variants: {
      variant: {
        received: "self-start",
        sent: "self-end flex-row-reverse",
      },
      layout: {
        default: "",
        ai: "max-w-full w-full items-center",
      },
    },
    defaultVariants: {
      variant: "received",
      layout: "default",
    },
  }
);

export const chatBubbleMessageVariants = cva(
  "px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
  {
    variants: {
      variant: {
        received:
          "bg-card text-foreground rounded-2xl rounded-bl-sm border border-border/60",
        sent:
          "bg-primary text-primary-foreground rounded-2xl rounded-br-sm",
      },
      layout: {
        default: "",
        ai: "border-t w-full rounded-none bg-transparent shadow-none",
      },
    },
    defaultVariants: {
      variant: "received",
      layout: "default",
    },
  }
);

export type ChatBubbleVariantProps = VariantProps<typeof chatBubbleVariant>;
export type ChatBubbleMessageVariantProps = VariantProps<typeof chatBubbleMessageVariants>;
