import React, { useRef, useState } from 'react';
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonBadge,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner,
  useIonViewWillEnter,
} from '@ionic/react';
import { useChatStore, ChatItem } from '../stores/useChatStore';

export const ChatList: React.FC<{
  onChatClick: (chat: ChatItem) => void;
}> = ({ onChatClick }) => {
  const { chats, selectedChat, fetchChats, hasMoreChats, isLoadingChats } = useChatStore();

  // rerender-state-only-in-handlers: page no dispara re-renders, es solo un cursor de paginación
  const pageRef = useRef(1);
  const [searchText, setSearchText] = useState('');

  useIonViewWillEnter(() => {
    if ((chats || []).length === 0) {
      fetchChats(1);
    }
  });

  const doRefresh = async (event: any) => {
    useChatStore.setState({ chats: [], hasMoreChats: true });
    await fetchChats(1);
    pageRef.current = 1;
    event.detail.complete();
  };

  const loadMoreChats = async (event: any) => {
    if (hasMoreChats) {
      const nextPage = pageRef.current + 1;
      pageRef.current = nextPage;
      await fetchChats(nextPage);
    }
    event.target.complete();
  };

  const filteredChats = chats.filter(chat =>
    chat.Contact?.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <>
      <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
        <IonRefresherContent />
      </IonRefresher>

      <IonSearchbar
        value={searchText}
        onIonInput={(e) => setSearchText(e.detail.value!)}
        placeholder="Buscar conversaciones..."
      />

      <IonList>
        {filteredChats.map((chat) => (
          <IonItem
            key={chat.id}
            button
            onClick={() => onChatClick(chat)}
            detail={false}
            lines="full"
            color={selectedChat?.id === chat.id ? 'light' : ''}
          >
            <IonAvatar slot="start">
              <img
                src={chat.Contact?.profilePicURl || `https://ui-avatars.com/api/?name=${chat.Contact?.name || '?'}`}
                alt={chat.Contact?.name}
              />
            </IonAvatar>
            <IonLabel>
              <h2>{chat.Contact?.name || 'Desconocido'}</h2>
              <p className="text-ellipsis overflow-hidden whitespace-nowrap">
                {chat.lastMessage || 'No hay mensajes'}
              </p>
            </IonLabel>
            {chat.unreadMessages > 0 && (
              <IonBadge color="primary" slot="end">
                {chat.unreadMessages}
              </IonBadge>
            )}
          </IonItem>
        ))}
      </IonList>

      <IonInfiniteScroll onIonInfinite={loadMoreChats} disabled={!hasMoreChats || isLoadingChats}>
        <IonInfiniteScrollContent
          loadingSpinner="bubbles"
          loadingText="Cargando más chats..."
        />
      </IonInfiniteScroll>

      {isLoadingChats && chats.length === 0 && (
        <div className="flex justify-center p-4">
          <IonSpinner name="crescent" />
        </div>
      )}
    </>
  );
};
