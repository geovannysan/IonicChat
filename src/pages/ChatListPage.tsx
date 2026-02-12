/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonText,
  IonIcon,
  IonButton,
  IonButtons
} from '@ionic/react';
import {
  chatbubbleOutline,
  filterOutline,
  refreshCircleOutline,
  refreshOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useDataStore } from '../stores/useTicketsChat';
import { useAuthContext } from '../contexts/AuthContext';
import { cn, formatWhatsAppDate } from '../lib/utils';
import SoftBadgeDemo  from '@/components/ui/chat/Sidebar';
import { Badge } from '@/components/ui/Badge';
import { HandMetalIcon, MessageCircleCode, UserRoundIcon } from 'lucide-react';
import {  AvatarFallback } from '@/components/ui/avatar';
import { Avatar } from '@radix-ui/react-avatar';

const ChatListPage: React.FC = () => {
  const history = useHistory();
  const { user } = useAuthContext();
  const {
    chats,
    fetchUsers,
    hasMore,
    isLoading,
    fetchChatHistory,
    setSelectedTicketChat
  } = useDataStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    // Cargar chats iniciales
    fetchUsers(1);
  }, [fetchUsers]);

  const sortedChats = useMemo(() => {
    let filteredChats = [...chats];

    // Filtro de búsqueda
    if (searchTerm) {
      filteredChats = filteredChats.filter((chat) => {
        const searchableText = [
          chat.Contact?.name,
          chat.lastMessage,
          chat.Contact?.number
        ].join(" ").toLowerCase();

        return searchableText.includes(searchTerm.toLowerCase());
      });
    }

    // Ordenar por fecha de actualización
    return filteredChats.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [chats, searchTerm]);

  const handleChatSelect = (chat: any) => {
    setSelectedTicketChat(chat);
    fetchChatHistory(chat.id, 1);
    history.push(`/chat/${chat.id}`);
  };

  const handleRefresh = async (event: CustomEvent) => {
    setPageNumber(1);
    await fetchUsers(1);
    event.detail.complete();
  };

  const loadMoreChats = async (event: CustomEvent) => {
    if (hasMore && !isLoading) {
      const nextPage = pageNumber + 1;
      setPageNumber(nextPage);
      await fetchUsers(nextPage);
    }
    event.detail.complete();
  };

 


  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>Chats</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={()=>fetchUsers(1)}>
              <IonIcon icon={refreshCircleOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={refreshOutline}
            pullingText="Desliza para actualizar"
            refreshingSpinner="circles"
            refreshingText="Actualizando..."
          />
        </IonRefresher>

        <IonSearchbar
          value={searchTerm}
          onIonInput={(e) => setSearchTerm(e.detail.value!)}
          placeholder="Buscar chats..."
          showClearButton="focus"
        />

        {sortedChats.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <IonIcon
              icon={chatbubbleOutline}
              size="large"
              color="medium"
              className="mb-4"
            />
            <IonText color="medium">
              <h3>Sin chats disponibles</h3>
              <p>No hay conversaciones para mostrar</p>
            </IonText>
          </div>
        ) : (
          // <Sidebar
          //   chats={sortedChats.map((user) => ({
          //     id: user.id,
          //     name: user.Contact?.name,
          //     messages: user.lastMessage ?? "",
          //     avatar: user.Contact?.profilePicURl,
          //     variant: "ghost",
          //     ChatItem: user,
          //   }))}
          //   onSelectUser={handleChatSelect}
          // />
          <IonList >
            {sortedChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
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

                    {chat.userId != null && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative">
                          <Badge className="rounded-full" variant="outline">
                            <span className="text-xs text-white font-medium">
                              {chat?.userId == user?.id ? "MI" : "AG"}
                            </span>
                          </Badge>
                          {chat?.userId == user?.id && (
                            <div className="h-2.5 w-2.5 ring-2 ring-background rounded-full bg-green-500 absolute bottom-0 right-0"></div>
                          )}
                          {chat?.userId != user?.id && (
                            <div className="h-2.5 w-2.5 ring-2 ring-background rounded-full bg-yellow-500 absolute bottom-0 right-0"></div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col w-full gap-1" title={chat.messages}>
                    <div className="flex justify-between items-center">
                      <Badge className="rounded-full pl-[3px]" variant="secondary">
                        {!chat?.ChatPerfil?.conexionID && (
                          <MessageCircleCode height={20} width={20} />
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
                          key={"bg"+idx}
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
            ))}

          </IonList>
        )}


        {isLoading && sortedChats.length === 0 && (
          <div className="flex justify-center items-center p-4">
            <IonSpinner name="crescent" />
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ChatListPage;

