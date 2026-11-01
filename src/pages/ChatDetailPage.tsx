/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonFooter,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
  useIonViewWillLeave,
  useIonViewDidEnter,
} from '@ionic/react';
import { ellipsisVertical, arrowBack } from 'ionicons/icons';
import { ChatLists } from '../components/ui/chat/chat-list';
import { useChatDetail } from '../hooks/useChatDetail';
import './ChatDetailPage.css';
import ChatBottombar from '@/components/ui/chat/chat-bottombar';
import { useAuthContext } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import { useDataStore } from '@/stores/useTicketsChat';
import { useHistory } from 'react-router';
import { App } from '@capacitor/app';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/Button';
import { LoaderCircle } from 'lucide-react';

const ChatDetailPage: React.FC = () => {
  const { user } = useAuthContext();
  const history = useHistory();
  const popoverRef = useRef<HTMLIonPopoverElement>(null);

  const {
    ticketChat,
    chatHistory,
    scrollRef,
    isLoading,
    handleScrolltop,
  } = useChatDetail();

  const {
    setSelectedTicketChat,
    deleteChat,

    deletteChat,
  } = useDataStore();

  const handleSubmit = async () => {
    try {
      const chat: any = await apiService.request(
        '/Tickets/open/' + ticketChat.id + '/' + user.id
      );
      setSelectedTicketChat(chat);
      popoverRef.current?.dismiss();
    } catch (error) {
      console.error('Error al abrir ticket:', error);
    }
  };

  const handleClose = async () => {
    history.replace('/tabs/chat');
    try {
      await apiService.request('/Tickets/close/' + ticketChat.id, {
        method: 'DELETE',
      });
      deleteChat(ticketChat.id);
    } catch (error) {
      console.error('Error al resolver ticket:', error);
    }
  };

  const backButtonListener = useRef<any>(null);

  useIonViewDidEnter(() => {
    backButtonListener.current = App.addListener(
      'backButton',
      ({ canGoBack }) => {
        deletteChat();
        if (canGoBack) {
          history.replace('/tabs/chat');
        } else {
          history.replace('/tabs/chat');
        }
      }
    );
  });

  useIonViewWillLeave(() => {
    if (backButtonListener.current) {
      backButtonListener.current.remove();
    }
  });

  useEffect(() => {
    return () => {
      deletteChat();
    };
  }, [deletteChat]);



  const contactName = ticketChat.Contact?.name || 'Usuario';
  const contactNumber = ticketChat.Contact?.number || '';
  const initials = contactName.substring(0, 2).toUpperCase();

  return (
    <IonPage>
      {/* ── Header ── */}
      <IonHeader className="ion-no-border">
        <IonToolbar className="border-b border-border bg-card">
          <IonButtons slot="start">
            <IonButton
              fill="clear"
              onClick={() => {
                history.goBack();
                deletteChat();
              }}
            >
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>

          {/* Avatar + nombre + número */}
          <div className="flex items-center gap-3 px-1">
            <Avatar className="w-8 h-8 border border-border shadow-sm shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-foreground leading-tight truncate">
                {contactName}
              </span>
              {contactNumber && (
                <span className="text-[11px] text-muted-foreground leading-tight truncate">
                  {contactNumber}
                </span>
              )}
            </div>
          </div>

          <IonButtons slot="end">
            <IonButton id="chat-detail-trigger" fill="clear">
              <IonIcon icon={ellipsisVertical} />
            </IonButton>
          </IonButtons>

          <IonPopover
            ref={popoverRef}
            trigger="chat-detail-trigger"
            triggerAction="click"
          >
            <IonContent>
              <IonList lines="none">
                {ticketChat.userId === null &&
                  ticketChat.status !== 'open' && (
                    <IonItem button onClick={handleSubmit}>
                      <IonLabel>Abrir</IonLabel>
                    </IonItem>
                  )}
                {ticketChat.status === 'open' &&
                  user.id === ticketChat.userId && (
                    <IonItem button onClick={handleClose}>
                      <IonLabel>Resolver</IonLabel>
                    </IonItem>
                  )}
              </IonList>
            </IonContent>
          </IonPopover>
        </IonToolbar>
      </IonHeader>

      {/* ── Mensajes ── */}
      <IonContent className="ion-no-padding">
       
        <ChatLists
          messages={chatHistory}
          onScroll={handleScrolltop}
          loading={isLoading.current}
          scrollRef={scrollRef}
          type={ticketChat.ChatPerfil?.conexionID ?? 1}
        />
      </IonContent>
 {/* Spinner de carga de mensajes anteriores */}
        {isLoading.current && (
          <Button
            disabled
            size="icon"
            variant="outline"
            className="absolute top-10 left-1/2 -translate-x-1/2 z-10 rounded-full shadow-md bg-card/80 backdrop-blur-sm border-border"
            aria-label="Cargando mensajes"
          >
            <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
          </Button>
        )}
      {/* ── Footer: sin IonToolbar doble, directamente ChatBottombar ── */}
      <IonFooter className="ion-no-border">
        <div className="bg-card border-t border-border">
          <ChatBottombar
            selectedUser={ticketChat}
            user={user}
            isMobile={true}
          />
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default ChatDetailPage;
