import React, { useEffect, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonAvatar,
  IonFooter,
  IonInput,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { useChatStore, Message } from '../stores/useChatStore';
import { chevronBack, send } from 'ionicons/icons';
import { useAuth } from '@/hooks/useAuth';

// Placeholder for individual chat message bubble
const ChatMessage: React.FC<{ message: Message; isMe: boolean }> = ({ message, isMe }) => {
    const alignment = isMe ? 'ion-text-right' : 'ion-text-left';
    const bubbleColor = isMe ? 'primary' : 'light';
    
    return (
        <div className={`ion-padding-horizontal ion-padding-vertical ${alignment}`}>
            <div style={{
                background: `var(--ion-color-${bubbleColor})`,
                color: `var(--ion-color-${bubbleColor}-contrast)`,
                borderRadius: '10px',
                padding: '10px',
                display: 'inline-block',
                maxWidth: '80%',
            }}>
                <p style={{ margin: 0 }}>{message.body}</p>
                <small style={{ opacity: 0.6 }}>
                    {new Date(message.createdAt).toLocaleTimeString()}
                </small>
            </div>
        </div>
    );
};


export const ChatView: React.FC = () => {
  const {
    selectedChat,
    messages,
    fetchMoreMessages,
    isLoadingMessages,
    hasMoreMessages,
    clearChat,
  } = useChatStore();
  const { user } = useAuth();
  const contentRef = useRef<HTMLIonContentElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    contentRef.current?.scrollToBottom(300);
  }, [messages]);

  const handleInfiniteScroll = async (ev: any) => {
    await fetchMoreMessages();
    ev.target.complete();
  };

  // This component should not be rendered if there is no selected chat,
  // the parent component will handle that.
  if (!selectedChat) {
    return null;
  }

  return (
    <>
        <IonHeader>
            <IonToolbar>
            <IonButtons slot="start" className="ion-hide-lg-up">
                <IonButton onClick={() => clearChat()}>
                    <IonIcon slot="icon-only" icon={chevronBack} />
                </IonButton>
            </IonButtons>
            <div className="flex items-center pl-2">
                <IonAvatar>
                    <img src={selectedChat.Contact?.profilePicURl || `https://ui-avatars.com/api/?name=${selectedChat.Contact?.name || '?'}`} alt="avatar" />
                </IonAvatar>
                <IonTitle className="ion-no-padding ion-padding-start">{selectedChat.Contact?.name}</IonTitle>
            </div>
            </IonToolbar>
        </IonHeader>

        <IonContent ref={contentRef} scrollEvents={true}>
            <IonInfiniteScroll
                position="top"
                onIonInfinite={handleInfiniteScroll}
                disabled={!hasMoreMessages || isLoadingMessages}
            >
                <IonInfiniteScrollContent loadingSpinner="bubbles" />
            </IonInfiniteScroll>

            {isLoadingMessages && (messages || []).length === 0 ? (
                <div className="flex justify-center items-center h-full">
                    <IonSpinner />
                </div>
            ) : (
                messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} isMe={msg.fromMe} />
                ))
            )}
        </IonContent>

        <IonFooter>
            <IonToolbar>
                <div className="flex items-center p-2">
                    <IonInput
                        placeholder="Escribe un mensaje..."
                        className="flex-grow"
                        style={{ background: 'var(--ion-color-light)', borderRadius: '20px', paddingLeft: '15px' }}
                    />
                    <IonButton fill="clear" className="ion-no-margin">
                        <IonIcon icon={send} slot="icon-only" />
                    </IonButton>
                </div>
            </IonToolbar>
        </IonFooter>
    </>
  );
};

