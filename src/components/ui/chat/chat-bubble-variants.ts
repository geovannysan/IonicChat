import { cva, type VariantProps } from "class-variance-authority";

export const chatBubbleVariant = cva(
  "flex gap-2 max-w-[60%] items-end relative group",
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

export const chatBubbleMessageVariants = cva("p-3 text-sm", {
  variants: {
    variant: {
      received: "bg-gray-200 text-gray-800 rounded-lg",
      sent: "bg-blue-500 text-white rounded-lg",
    },
    layout: {
      default: "",
      ai: "border-t w-full rounded-none bg-transparent",
    },
  },
  defaultVariants: {
    variant: "received",
    layout: "default",
  },
});

export type ChatBubbleVariantProps = VariantProps<typeof chatBubbleVariant>;
export type ChatBubbleMessageVariantProps = VariantProps<typeof chatBubbleMessageVariants>;
