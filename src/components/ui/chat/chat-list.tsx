import { memo, useMemo } from "react";
import { Forward } from "lucide-react";
// use-lazy-motion: LazyMotion + domAnimation + m.div en vez de motion.div
// reduce el bundle cargando solo las animaciones necesarias
import { LazyMotion, domAnimation, m } from "framer-motion";
import { ChatBubble, ChatBubbleAction, ChatBubbleActionWrapper, ChatBubbleMessage, ChatBubbleTimestamp } from "./chat-bubble";
import { formatWhatsAppDate } from "../../../lib/utils";
import { MediaPreview } from "../Mediapreview";
import { Message } from '../../../../src/types';
import { ChatMessageList } from "./chat-message-list";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip";

const getMessageVariant = (fromMe: boolean) =>
  fromMe ? "sent" : "received";

interface ChatListComponentProps {
  messages: Message[];
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  scrollRef?: React.RefObject<HTMLDivElement | null> | null;
  loading: boolean;
  history?: boolean;
  type: string | number;
}

const actionIcons = [
  { icon: Forward, type: "Forward" },
];

function ChatListComponent({ messages, onScroll, scrollRef, loading, history = false, type }: Readonly<ChatListComponentProps>) {
  const renderedMessages = useMemo(() => {
    if (!messages || (messages ?? []).length === 0) return [];

    return messages.map((message: Message, index: number) => {
      const variant = getMessageVariant(message.fromMe);
      const avatarSrc = message.contact?.profilePicUrl || undefined;
      const avatarFallback = message.contact?.name
        ? message.contact.name.charAt(0).toUpperCase()
        : undefined;

      return (
        // key estable: message.id (string requerido en la interfaz Message, nunca índice)
        <m.div
          key={message.id}
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
                <div className="border-l-4 border-green-500 min-h-1.5 pl-2 mb-1 text-sm text-muted-foreground bg-muted/30 rounded-sm">
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

            {!history && (
              <ChatBubbleActionWrapper>
                {Number(type) < 3 && actionIcons.map(({ icon: Icon, type }) => (
                  <ChatBubbleAction
                    className="size-5"
                    key={type}
                    icon={<Icon className="size-2" />}
                    onClick={() => console.log({ ...message })}
                  />
                ))}
              </ChatBubbleActionWrapper>
            )}
          </ChatBubble>
        </m.div>
      );
    });
  }, [messages, history, type]);

  return (
    // LazyMotion: carga las animaciones de forma diferida para reducir el bundle inicial
    <LazyMotion features={domAnimation}>
      <TooltipProvider>
        <ChatMessageList scrollRef={scrollRef} onScroll={onScroll} loading={loading} type={type}>
          {renderedMessages}
        </ChatMessageList>
      </TooltipProvider>
    </LazyMotion>
  );
}

export const ChatLists = memo(
  ChatListComponent,
  (prevProps, nextProps) => prevProps.messages === nextProps.messages,
);
