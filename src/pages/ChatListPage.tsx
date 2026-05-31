
import React, { useEffect, useState, useMemo, useLayoutEffect } from 'react';
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
  IonTabBar,
  IonTabButton,
  IonLabel,
} from '@ionic/react';
import {
  chatbubbleOutline,
  refreshOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { ChatItem, useDataStore } from '../stores/useTicketsChat';
import { useAuthContext } from '../contexts/AuthContext';
import { cn, formatWhatsAppDate } from '../lib/utils';
import SoftBadgeDemo from '@/components/ui/chat/Sidebar';
import { Badge } from '@/components/ui/Badge';
import { MessageCircleCode, UserRoundIcon } from 'lucide-react';
import { AvatarFallback } from '@/components/ui/avatar';
import { Avatar } from '@radix-ui/react-avatar';
import { variable } from "../../everimont/everimonet"

import Onesignal from "onesignal-cordova-plugin"
import apiService from '@/services/api';
import { isnotMovileDevice } from '@/utils/validar.util';
import { Etiqueta } from '@/types';
const ChatListPage: React.FC = () => {
  const history = useHistory();
  const { user } = useAuthContext();
  const {
    chats,
    fetchUsers,
    isLoading,
    setSelectedTicketChat,

  } = useDataStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'asignadas' | 'mias' | 'pendientes' | 'todas'>('todas');
  useEffect(() => {
    fetchUsers(1);
    console.log("Chats cargados:", chats);
  }, [fetchUsers]);
  const handleChatSelect = (chat: ChatItem) => {

    history.push(`/chat/${chat.id}`);
    setSelectedTicketChat(chat);
  };

  const handleRefresh = async (event: CustomEvent) => {

    await fetchUsers(1);
    event.detail.complete();
  };


  const sortedChats = useMemo(() => {
    let filteredChats = [...chats];

    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();

      filteredChats = filteredChats.filter((chat) => {
        // Unimos valores del objeto, pero filtrando solo strings/números para evitar errores
        const valores = Object.values(chat)
          .map(v => (v ? String(v).toLowerCase() : ""))
          .join(" ");

        const matchesValores = valores.includes(searchLower);

        // Usamos ?? "" para que si la propiedad es null/undefined, no falle el .toLowerCase()
        const matchesLastMsg = (chat.lastMessage ?? "").toLowerCase().includes(searchLower);
        const matchesName = (chat.name ?? "").toLowerCase().includes(searchLower);
        const matchesNumber = (chat.Contact?.number ?? "").toLowerCase().includes(searchLower);

        return matchesValores || matchesLastMsg || matchesName || matchesNumber;
      });
    }

    if (activeTab === "mias" && filteredChats.length > 0) {
      filteredChats = filteredChats.filter((chat) => chat.userId == user.id)
    }
    if (activeTab === "asignadas" && filteredChats.length > 0) {
      filteredChats = filteredChats.filter((chat) => chat.status == "assigned")
    }
    if (activeTab === "pendientes" && filteredChats.length > 0) {
      filteredChats = filteredChats.filter((chat) => chat.userId == null)
    }


    return filteredChats.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [chats, searchTerm, activeTab, user.id]);
  useLayoutEffect(() => {
    if (isnotMovileDevice()) return;

    const setupNotifications = async () => {
      if(isnotMovileDevice()) return;
      try {
        Onesignal.initialize(variable.onesignaid);

        const hasPermission = await Onesignal.Notifications.requestPermission(true);

        if (hasPermission) {
          Onesignal.User.pushSubscription.optIn();
          const account = user.cuenta.find((el:{ accountId: string; }) => el.accountId == user.perfil);

          Onesignal.login(account.accountId + "_" + account.id)
          const currentId = await Onesignal.User.getOnesignalId();
          if (currentId) {
            console.log("pushId inicial:", currentId);
            updateUserInDB(currentId);
          }

          Onesignal.User.pushSubscription.addEventListener("change", (event) => {
            const newId = event.current.id;
            if (newId) {
              updateUserInDB(newId);
            }
          });

          Onesignal.Notifications.addEventListener('click', (e) => {
            const data = e.notification.additionalData as { url?: string };
            if (data?.url) {
              history.push(data.url);
            }
          });
        }
      } catch (error) {
        console.error("Error configurando notificaciones:", error);
      }
    };

    setupNotifications();
  }, []);

  const updateUserInDB = async (pushId: string) => {
    console.log("Updating user with pushId:", pushId);
    if (!user) return;
    const account = user.selectedAccount;

    if (account) {
      await apiService.request("/Users/acount/" + account.id, {
        method: "PUT",
        data: { idWorkspace: pushId }
      });
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>Chats</IonTitle>
          <IonSearchbar
            value={searchTerm}
            onIonInput={(e) => setSearchTerm(e.detail.value!)}
            placeholder="Buscar chats..."
            showClearButton="focus"
          />
        </IonToolbar>
      </IonHeader>

      <IonTabBar slot='top' className="ion-no-padding" >
        <IonTabButton tab="todas" onClick={() => setActiveTab('todas')} selected={activeTab === 'todas'}>

          <IonLabel>Todas </IonLabel>
        </IonTabButton>
        <IonTabButton tab="mias" onClick={() => setActiveTab('mias')} selected={activeTab === 'mias'}>

          <IonLabel>Mias</IonLabel>
        </IonTabButton>
        <IonTabButton tab="pendientes" onClick={() => setActiveTab('pendientes')} selected={activeTab === 'pendientes'}>

          <IonLabel>Pendien.</IonLabel>
        </IonTabButton>
        <IonTabButton tab="asignadas" onClick={() => setActiveTab('asignadas')} selected={activeTab === 'asignadas'}>

          <IonLabel>Asigna.</IonLabel>
        </IonTabButton>

      </IonTabBar>

      <IonContent className="ion-no-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={refreshOutline}
            pullingText="Desliza para actualizar"
            refreshingSpinner="circles"
            refreshingText="Actualizando..."
          />
        </IonRefresher>



        {sortedChats.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <IonIcon
              icon={chatbubbleOutline}
              size="large"
              color="medium"
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
                          <Badge className="rounded-full" >
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
                      <Badge className="rounded-full align-center pl-[3px]" variant="secondary">
                        {!chat?.ChatPerfil?.conexionID && (
                          <MessageCircleCode height={20} width={20} />
                        )}
                        <div className="align-middle text-center font-medium">
                          {chat?.ChatPerfil?.name || "PaperLayer Channel"}
                        </div>
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
                  {chat.Teams?.name && (
                    <Badge className="rounded-full">
                      <div className="h-1.5 w-1.5 rounded-full mr-2" style={{
                        backgroundColor: chat.Teams?.color
                      }} />
                      {chat.Teams?.name}
                    </Badge>
                  )}
                  {chat.etiquetas && (
                    <div className="flex items-center">
                      {chat.etiquetas.slice(0, 3).map((tag: Etiqueta, idx: number) => (
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

