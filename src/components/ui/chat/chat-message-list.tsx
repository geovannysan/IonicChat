/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { ArrowDown, LoaderCircle } from "lucide-react";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { Button } from "../Button";

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  loading: boolean;
  scrollRef?: React.RefObject<HTMLDivElement>;
}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ className, children, onScroll, loading, scrollRef, ...props }, _ref) => {
      const { containerRef, isAtBottom, scrollToBottom } = useAutoScroll([children], scrollRef);
    
    // Usar scrollRef si se proporciona, de lo contrario usar containerRef
    const actualRef = scrollRef || containerRef;

    return (
      <div className="relative w-full h-full">
        {loading && (
          <Button
            disabled
            size="icon"
            variant="outline"
            className="absolute top-2 left-1/2 transform -translate-x-1/2 inline-flex rounded-full shadow-md"
            aria-label="Scroll to top"
          >
            <LoaderCircle className="h-4 w-4 animate-spin" />
          </Button>
        )}
        <div
          className={`flex flex-col w-full h-full p-4 overflow-y-auto ${className}`}
          ref={actualRef}
          onScroll={onScroll}
          {...props}
        >
          <div className="flex flex-col gap-6">{children}</div>
        </div>

        {!isAtBottom && (
          <Button
            onClick={scrollToBottom}
            size="icon"
            variant="outline"
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 inline-flex rounded-full shadow-md"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  },
);

ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };
