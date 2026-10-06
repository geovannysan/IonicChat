/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef} from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonText,
  IonFooter,
  IonSpinner,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
  useIonViewWillLeave,
  useIonViewDidEnter
} from '@ionic/react';
import {
  ellipsisVertical,
  arrowBack
} from 'ionicons/icons';
import { ChatLists } from '../components/ui/chat/chat-list';
import { useChatDetail } from '../hooks/useChatDetail';
import './ChatDetailPage.css';
import ChatBottombar from '@/components/ui/chat/chat-bottombar';
import { useAuthContext } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import { useDataStore } from '@/stores/useTicketsChat';
import { useHistory } from 'react-router';
import { App } from '@capacitor/app';

const ChatDetailPage: React.FC = () => {
  const { user } = useAuthContext()
  const history = useHistory()
  const popoverRef = useRef<HTMLIonPopoverElement>(null);
  const {
    ticketChat,
    chatHistory,

    scrollRef,
    handleScrolltop
  } = useChatDetail();
  const {
    setSelectedTicketChat, deleteChat,
    fetchChatHistory,
    deletteChat, isLoading
  } = useDataStore();
  const handleSubmit = async () => {

    try {
      const chat: any = await apiService.request("/Tickets/open/" + ticketChat.id + "/" + user.id,);
      setSelectedTicketChat(chat);
      //fetchChatHistory(chat.id, 1)
      popoverRef.current?.dismiss();

    } catch (error) {
      console.error("Error al enviar:", error);
    }
  };
  const handleClose = async () => {
    history.replace("/tabs/chat")
    try {
      await apiService.request("/Tickets/" + ticketChat.id, {
        method: 'DELETE',
      });
      deleteChat(ticketChat.id);



    } catch (error) {
      console.error("Error al enviar:", error);
    }
  };
  const backButtonListener = useRef<any>(null);

  useIonViewDidEnter(() => {
    // Escuchamos el evento del botón atrás de Capacitor
    // Usamos una lógica de intercepción
    backButtonListener.current = App.addListener('backButton', ({ canGoBack }) => {

      if (canGoBack) {
        // Si la aplicación puede navegar hacia atrás, lo hacemos
        deletteChat();
        history.replace("/tabs/chat")
      } else {
        // Si no puede navegar hacia atrás, salimos de la aplicación
        history.replace("/tabs/chat")
      }

    });
  });

  useIonViewWillLeave(() => {
    // MUY IMPORTANTE: Limpiar el listener al salir de la página
    if (backButtonListener.current) {
      backButtonListener.current.remove();
    }
  });
  useEffect(() => {
    fetchChatHistory(ticketChat.id, 1)
    return () => {
      deletteChat();
    }
  }, [ticketChat.id, fetchChatHistory, deletteChat]);
  if (!ticketChat.id) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div className="flex justify-center items-center h-full">
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton size='small' onClick={() => {
              history.goBack()
              deletteChat()
            }} >
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>

          <div className="flex items-center">

            <div>
              <IonTitle size="small" className="text-left">
                {ticketChat.Contact?.name || 'Usuario'}
              </IonTitle>
              <IonText color="medium" className="text-xs">
                {ticketChat.Contact?.number}
              </IonText>
            </div>
          </div>
          <IonButtons slot="end">
            <IonButton id="click-trigger">
              <IonIcon icon={ellipsisVertical} />
            </IonButton>
          </IonButtons>
          <IonPopover ref={popoverRef} trigger="click-trigger" triggerAction="click">
            <IonContent>
              <IonList lines="none">
                {(ticketChat.userId === null && ticketChat.status !== "open") && (
                  <IonItem button
                    onClick={handleSubmit}
                  >

                    <IonLabel> Abrir</IonLabel>
                  </IonItem>)}
                {(ticketChat.status === "open" && (user.id === ticketChat.userId)) && (<IonItem button onClick={handleClose} >

                  <IonLabel>  Resolver</IonLabel>
                </IonItem>)}
              </IonList>
            </IonContent>
          </IonPopover>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <ChatLists
          messages={chatHistory}
          onScroll={handleScrolltop}
          loading={isLoading}
          scrollRef={scrollRef.current}
          type={ticketChat.ChatPerfil.conexionID ?? 1}
        />
      </IonContent>



      <IonFooter>
        <IonToolbar>

          <ChatBottombar selectedUser={ticketChat} user={user} isMobile={true} />
        </IonToolbar>
      </IonFooter>
      {/* <IonButton fill="clear" size="small" className="flex-shrink-0">
              <IonIcon icon={attachOutline} color="medium" />
            </IonButton>


            <IonInput
              value={message}
              onIonInput={(e) => setMessage(e.detail.value!)}
              placeholder="Escribe un mensaje..."
              className=""
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />


            <IonButton
              fill={message.trim() ? 'solid' : 'clear'}
              size="small"
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="chat-send-button"
              color={message.trim() ? 'primary' : 'medium'}
            >
              <IonIcon icon={sendOutline} />
            </IonButton> */}



      {/* ... IonModal ... */}
    </IonPage >
  );
};

export default ChatDetailPage;
