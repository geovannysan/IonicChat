import { memo, useMemo } from "react";
import { Forward } from "lucide-react";
import { motion } from "framer-motion";
import { IonContent, IonList } from "@ionic/react";
import { ChatBubble, ChatBubbleAction, ChatBubbleActionWrapper, ChatBubbleMessage, ChatBubbleTimestamp } from "./chat-bubble";
import { formatWhatsAppDate } from "../../../lib/utils";
import { MediaPreview } from "../Mediapreview";
import { Message } from '../../../../src/types'; // Import Message type
import { ChatMessageList } from "./chat-message-list";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip";

const getMessageVariant = (fromMe: boolean) =>
  fromMe ? "sent" : "received";

interface ChatListComponentProps {
  messages: Message[];
  onScroll: (e: any) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  loading: boolean;
  history?: boolean;
}

function ChatListComponent({ messages, onScroll, scrollRef, loading, history = false }: ChatListComponentProps) {
  const actionIcons = [
    { icon: Forward, type: "Forward" },
  ];

  const renderedMessages = useMemo(() => {
    if (!messages || messages.length === 0) return [];

    return messages.map((message: any, index: number) => {
      const variant = getMessageVariant(message.fromMe);
      const avatarSrc = message.contact?.profilePicUrl || undefined;
      const avatarFallback = message.contact?.name ? message.contact.name.charAt(0).toUpperCase() : undefined;

      return (
        <motion.div
          key={index}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 1 }}
          transition={{
            opacity: { duration: 0.1 },
            layout: {
              type: "spring",
              bounce: 0.3,
              duration: index * 0.03,
            },
          }}
          className="flex flex-col gap-2 px-2"
        >
          <ChatBubble variant={variant} avatarSrc={avatarSrc} avatarFallback={avatarFallback}>
            <ChatBubbleMessage isLoading={message.isLoading}>
              {message.quotedMsg && (
                <div className="border-l-4 border-green-500  min-h-1.5 pl-2 mb-1 text-sm text-muted-foreground bg-muted/30 rounded-sm">
                  {message?.quotedMsg?.mediaUrl ? (
                    <MediaPreview
                      type={message.quotedMsg.mediaType}
                      url={message.quotedMsg.mediaUrl || message.quotedMsg.body}
                      body={message.quotedMsg.body}
                    />
                  ) : (
                    <Tooltip>
                      <TooltipTrigger>
                        <p className="line-clamp-4 wrap-break-words text-left">
                          {message.quotedMsg.body}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{message.quotedMsg.body}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )}
              {message?.mediaUrl && (
                <MediaPreview
                  type={message.mediaType}
                  url={message.mediaUrl || message.body}
                  body={message.body}
                />
              )}

              {message.mediaType !== "location" &&
                message.mediaType !== "vcard" &&
                message.body}

              {message.createdAt && (
                <div className="flex justify-between">
                  <ChatBubbleTimestamp
                    timestamp={formatWhatsAppDate(message.createdAt)}
                  />

                </div>
              )}
            </ChatBubbleMessage>

            {history && (
              <ChatBubbleActionWrapper>
                {actionIcons.map(({ icon: Icon, type }) => (
                  <ChatBubbleAction
                    className="size-5"
                    key={type}
                    icon={<Icon className="size-4" />}
                    onClick={() => console.log({ ...message })}
                  />
                ))}
              </ChatBubbleActionWrapper>
            )}
          </ChatBubble>
        </motion.div>
      );
    });
  }, [messages, loading, history]);

  return (
    <TooltipProvider>
      <ChatMessageList scrollRef={scrollRef} onScroll={onScroll} loading={loading}>
        {renderedMessages}
      </ChatMessageList>
    </TooltipProvider>
  );
}

export const ChatLists = memo(
  ChatListComponent,
  (prevProps, nextProps) => prevProps.messages === nextProps.messages
);
