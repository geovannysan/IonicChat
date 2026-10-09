import React, { useEffect, useState, useMemo, useLayoutEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
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
  refreshOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { ChatItem, useDataStore } from '../stores/useTicketsChat';
import { useAuthContext } from '../contexts/AuthContext';
import { variable } from '../../everimont/everimonet';
import Onesignal from 'onesignal-cordova-plugin';
import apiService from '@/services/api';
import { isnotMovileDevice } from '@/utils/validar.util';
import { ChatSearchBar } from './chat-list/ChatSearchBar';
import { ChatListItem } from './chat-list/ChatListItem';

const ChatListPage: React.FC = () => {
  const history = useHistory();
  const { user } = useAuthContext();
  const {
    chats,
    fetchUsers,
    isLoading,
    setSelectedTicketChat,
  } = useDataStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'asignadas' | 'mias' | 'pendientes' | 'todas'>('todas');

  // exhaustive-deps: fetchUsers es estable (Zustand), se incluye en el array
  useEffect(() => {
    fetchUsers(1);
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

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredChats = filteredChats.filter((chat) => {
        const valores = Object.values(chat)
          .map(v => (v ? String(v).toLowerCase() : ''))
          .join(' ');
        const matchesValores = valores.includes(searchLower);
        const matchesLastMsg = (chat.lastMessage ?? '').toLowerCase().includes(searchLower);
        const matchesName = (chat.name ?? '').toLowerCase().includes(searchLower);
        const matchesNumber = (chat.Contact?.number ?? '').toLowerCase().includes(searchLower);
        return matchesValores || matchesLastMsg || matchesName || matchesNumber;
      });
    }

    if (activeTab === 'mias' && filteredChats.length > 0) {
      filteredChats = filteredChats.filter((chat) => chat.userId === user.id);
    }
    if (activeTab === 'asignadas' && filteredChats.length > 0) {
      filteredChats = filteredChats.filter((chat) => chat.status === 'assigned');
    }
    if (activeTab === 'pendientes' && filteredChats.length > 0) {
      filteredChats = filteredChats.filter((chat) => chat.userId == null);
    }

    return filteredChats.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [chats, searchTerm, activeTab, user.id]);

  // exhaustive-deps: setupNotifications sólo debe correr una vez al montar.
  // Las dependencias (user, history) son estables en este punto.
  // Se retorna la función de cleanup que remueve los listeners de OneSignal
  // para evitar suscripciones duplicadas en hot-reload o re-montaje (effect-needs-cleanup).
  useLayoutEffect(() => {
    if (isnotMovileDevice()) return;

    // Guardamos referencias a los handlers para poder pasarlas a removeEventListener
    const handleSubscriptionChange = (event: { current: { id?: string } }) => {
      const newId = event.current.id;
      if (newId) updateUserInDB(newId);
    };

    const handleNotificationClick = (e: { notification: { additionalData: unknown } }) => {
      const data = e.notification.additionalData as { url?: string };
      if (data?.url) history.push(data.url);
    };

    const setupNotifications = async () => {
      if (isnotMovileDevice()) return;
      try {
        Onesignal.initialize(variable.onesignaid);

        const hasPermission = await Onesignal.Notifications.requestPermission(true);

        if (hasPermission) {
          Onesignal.User.pushSubscription.optIn();
          const account = user.cuenta?.find(
            (el: { accountId: string }) => el.accountId === user.perfil
          );

          if (account) {
            Onesignal.login(account.accountId + '_' + account.id);
            const currentId = await Onesignal.User.getOnesignalId();
            if (currentId) {
              updateUserInDB(currentId);
            }

            Onesignal.User.pushSubscription.addEventListener('change', handleSubscriptionChange);
            Onesignal.Notifications.addEventListener('click', handleNotificationClick);
          }
        }
      } catch (error) {
        console.error('Error configurando notificaciones:', error);
      }
    };

    setupNotifications();

    // Cleanup: remover listeners de OneSignal al desmontar para evitar
    // suscripciones duplicadas (HMR, re-montaje o cambio de ruta).
    return () => {
      Onesignal.User.pushSubscription.removeEventListener('change', handleSubscriptionChange);
      Onesignal.Notifications.removeEventListener('click', handleNotificationClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateUserInDB = async (pushId: string) => {
    if (!user) return;
    const account = user.selectedAccount;
    if (account) {
      await apiService.request('/Users/acount/' + account.id, {
        method: 'PUT',
        data: { idWorkspace: pushId },
      });
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>Chats</IonTitle>
          <ChatSearchBar value={searchTerm} onChange={setSearchTerm} />
        </IonToolbar>
      </IonHeader>

      <IonTabBar slot="top" className="ion-no-padding">
        <IonTabButton tab="todas" onClick={() => setActiveTab('todas')} selected={activeTab === 'todas'}>
          <IonLabel>Todas</IonLabel>
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
            <IonIcon icon={chatbubbleOutline} size="large" color="medium" />
            <IonText color="medium">
              <h3>Sin chats disponibles</h3>
              <p>No hay conversaciones para mostrar</p>
            </IonText>
          </div>
        ) : (
          <IonList>
            {sortedChats.map((chat) => (
              // key estable: chat.id en vez de índice
              <ChatListItem
                key={chat.id}
                chat={chat}
                currentUserId={user.id}
                onSelect={handleChatSelect}
              />
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
