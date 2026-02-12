import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonAvatar,
  IonIcon,
  IonButton,
  IonCard,
  IonCardContent,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonList,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner
} from '@ionic/react';
import { chatbubbleOutline, locationOutline } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Contact } from '../types';
import apiService from '@/services/api';
import { useContactStore } from '@/stores/useContactStore';
import { cn, formatWhatsAppDate } from '@/lib/utils';
import { Avatar } from '@radix-ui/react-avatar';
import { AvatarFallback } from '@/components/ui/avatar';
import { HandMetalIcon, UserRoundIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import SoftBadgeDemo from '@/components/ui/chat/Sidebar';

export interface ContactParams {
  id: string;
}

const ContactDetailPage: React.FC = () => {
  const { id } = useParams<ContactParams>();
  const history = useHistory()
  const [contact, setContact] = useState<Contact | null>(null);
  const { hasMorehist: hasMore, isLoadingHis: isLoading, fetchChatHistory, chatHistory } = useContactStore()
  const [activeTab, setActiveTab] = useState<'detalle' | 'comentario' | 'historial'>('detalle');
  const [pageNumber, setPageNumber] = useState(1)

  useEffect(() => {
    loadContact();
  }, [id]);

  const loadContact = async () => {
    try {
      const response: any = await apiService.getContact(id);
      const data = response;
      setContact(data);
      fetchChatHistory(Number(id), pageNumber)
    } catch (error) {
      console.error('Error loading contact:', error);
    }
  };

  const loadMoreContacts = async (event: CustomEvent) => {
    if (!hasMore || isLoading) {
      (event.target as HTMLIonInfiniteScrollElement).complete();
      return;
    }

    loadMore();

    (event.target as HTMLIonInfiniteScrollElement).complete();
  };
  const loadMore = () => {
    if (hasMore) {
      setPageNumber((prevState) => prevState + 1);
      fetchChatHistory(Number(id), (pageNumber + 1))
    }
  };

  const historial=(idchat:string)=> history.push("/contact/historial/"+idchat)
  if (!contact) {
    return (
      <IonPage>
        <IonContent>
          <div className="ion-padding">Cargando...</div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/contact" />
          </IonButtons>
          <IonTitle>{contact.name}</IonTitle>
        </IonToolbar>
      </IonHeader>

      {activeTab === "detalle" && (<IonContent className="ion-padding">
        <IonCard>
          <IonCardContent className="text-center">
            <IonAvatar style={{ margin: '0 auto 16px', width: '80px', height: '80px' }}>
              <img src={`https://ui-avatars.com/api/?name=${contact.name}`} alt={contact.name} />
            </IonAvatar>
            <h2>{contact.name}</h2>
          </IonCardContent>
        </IonCard>





        <IonButton expand="block" className="ion-margin">
          <IonIcon icon={chatbubbleOutline} slot="start" />
          Iniciar Chat
        </IonButton>
      </IonContent>)}
      {activeTab === "historial" && (
        <IonContent className=' ion-padding'>
          <IonLabel>Historial</IonLabel>
          <IonList>
            {chatHistory.sort((a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            ).map((chat) => (
              <div
                key={chat.id}
                onClick={()=>historial(chat.id)}
                className={cn(
                  "w-full flex flex-col gap-1 p-3 transition-all cursor-pointer hover:bg-muted/30 border-b border-zinc-200 dark:border-zinc-700",
                  chat.variant === "secondary" && "bg-cyan-900/10 text-white hover:bg-cyan-900/20"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex flex-col justify-between items-center gap-3 p-2">
                    <Avatar className="flex justify-center items-center">
                      <AvatarFallback className="bg-blue-500 text-white">
                        <UserRoundIcon className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>

                    {chat.id}
                  </div>

                  <div className="flex flex-col w-full gap-1" title={chat.messages}>
                    <div className="flex justify-between items-center">
                      <Badge className="rounded-full pl-[3px]" variant="secondary">
                        {!chat?.ChatPerfil?.conexionID && (
                          <HandMetalIcon height={20} width={20} />
                        )}
                        <span className="text-xs text-muted-foreground font-medium">
                          {chat?.ChatPerfil?.name || "PaperLayer Channel"}
                        </span>
                      </Badge>

                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <span>{formatWhatsAppDate(chat.updatedAt) || "1h"}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm text-foreground">
                        {chat?.Contact?.name || "Sin nombre"}
                      </span>

                      <span
                        className="text-muted-foreground truncate text-start text-sm"
                        style={{
                          maxHeight: "50px",
                          overflow: "hidden",
                        }}
                      >
                        {chat.lastMessage
                          ? String(chat.lastMessage).substring(0, 37)
                          : "Sin mensajes"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1 mt-2 flex-wrap w-full pl-18">
                  <SoftBadgeDemo status={"" + chat.status} />
                  {chat.Teams && (
                    <Badge className="rounded-full">
                      <div className="h-1.5 w-1.5 rounded-full mr-2" style={{
                        backgroundColor: chat.Teams?.color
                      }} />
                      {chat.Teams?.name}
                    </Badge>
                  )}
                  {chat.etiquetas && (
                    <div className="flex items-center">
                      {chat.etiquetas.slice(0, 3).map((tag: any, idx: number) => (
                        <Badge
                          key={"bg" + idx}
                          className={cn(
                            "text-white h-5 w-5",
                            tag.color ? "" : "bg-gray-400"
                          )}
                          style={tag.color ? { backgroundColor: tag.color } : {}}
                        >
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              // <IonItem
              //   key={chat.id}
              //   button
              //   onClick={() => handleChatSelect(chat)}
              //   detail={false}>
              //   <IonIcon color="danger" slot="start" icon={person} size="small"></IonIcon>

              //   <div className="unread-indicator-wrapper" slot="start">
              //     <div className="unread-indicator"></div>
              //   </div>
              //   <IonLabel>
              //     <strong> {chat.Contact?.name || 'Usuario'}</strong>

              //     <br />
              //     <IonNote color="medium" className="ion-text-wrap">
              //       {chat.lastMessage || 'Sin mensajes'}
              //     </IonNote>
              //   </IonLabel>
              //   <div className="metadata-end-wrapper" slot="end">
              //     <IonNote color="medium">{formatWhatsAppDate(chat.updatedAt)}</IonNote>

              //   </div>
              // </IonItem>
            ))

            }

          </IonList>
          <IonInfiniteScroll
            onIonInfinite={loadMoreContacts}
            threshold="100px"
            disabled={!hasMore}
          >

            <IonInfiniteScrollContent
              loadingSpinner="bubbles"
              loadingText="Cargando más contactos..."
            />
          </IonInfiniteScroll>


          {isLoading && chatHistory.length === 0 && (
            <div className="flex justify-center items-center p-4">
              <IonSpinner name="crescent" />
            </div>
          )}
        </IonContent>)}
      <IonTabBar slot='bottom' >
        <IonTabButton tab="detalle" onClick={() => setActiveTab('detalle')} selected={activeTab === 'detalle'}>
          <IonIcon icon={locationOutline} slot="start" />
          <IonLabel>Detalles</IonLabel>
        </IonTabButton>
        <IonTabButton tab="historial" onClick={() => setActiveTab('historial')} selected={activeTab === 'historial'}>
          <IonIcon icon={locationOutline} slot="start" />
          <IonLabel>Historial</IonLabel>
        </IonTabButton>

      </IonTabBar>
    </IonPage>
  );
};

export default ContactDetailPage;
