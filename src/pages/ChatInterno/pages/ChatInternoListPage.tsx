import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  IonText,
  IonSpinner,
} from '@ionic/react';
import { chatbubblesOutline, refreshOutline, searchOutline, closeOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useInternalChatUsers } from '../hooks/useInternalChatUsers';
import { InternalUserItem } from '../components/InternalUserItem';
import { UserListSkeleton } from '../components/ChatSkeleton';
import type { ChatInternalUser } from '../models/chat-message.interface';

/**
 * ChatInternoListPage
 *
 * Lista de usuarios con quienes el usuario autenticado puede chatear.
 * Al tocar un usuario navega a ChatInternoConversationPage.
 */
const ChatInternoListPage: React.FC = () => {
  const history = useHistory();
  const { user: me } = useAuthContext();

  const {
    isLoading,
    error,
    refresh,
    searchTerm,
    setSearchTerm,
    filteredUsers,
  } = useInternalChatUsers();

  const handleSelectUser = (other: ChatInternalUser) => {
    history.push(`/internal-chat/${me.id}/${other.id}`, {
      otherUser: other,
    });
  };

  const handleRefresh = async (event: CustomEvent) => {
    await refresh();
    event.detail.complete();
  };

  return (
    <IonPage>
      {/* ── Header ── */}
      <IonHeader className="ion-no-border">
        <IonToolbar className="border-b border-border bg-card">
          <div className="flex flex-col px-3 pt-2 pb-1 gap-2">
            {/* Título */}
            <div className="flex items-center gap-2">
              <IonIcon
                icon={chatbubblesOutline}
                className="text-primary text-lg"
              />
              <span className="text-base font-semibold text-foreground">
                Chat Interno
              </span>
            </div>

            {/* Barra de búsqueda */}
            <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-1.5 border border-border/40">
              <IonIcon
                icon={searchOutline}
                className="text-muted-foreground text-sm shrink-0"
                aria-hidden="true"
              />
              <input
                type="text"
                aria-label="Buscar usuario"
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                  aria-label="Limpiar búsqueda"
                >
                  <IonIcon icon={closeOutline} className="text-sm" />
                </button>
              )}
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      {/* ── Contenido ── */}
      <IonContent className="ion-no-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={refreshOutline}
            pullingText="Desliza para actualizar"
            refreshingSpinner="circles"
            refreshingText="Actualizando..."
          />
        </IonRefresher>

        {/* Skeleton mientras carga por primera vez */}
        {isLoading && filteredUsers.length === 0 && <UserListSkeleton />}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4 gap-3">
            <IonIcon
              icon={chatbubblesOutline}
              className="text-4xl text-destructive"
            />
            <IonText color="danger">
              <p className="text-sm">{error}</p>
            </IonText>
            <button
              type="button"
              onClick={() => refresh()}
              className="text-sm text-primary underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <IonIcon
              icon={chatbubblesOutline}
              size="large"
              color="medium"
            />
            <IonText color="medium">
              <h3 className="text-base font-semibold mt-2">
                {searchTerm ? 'Sin resultados' : 'Sin usuarios disponibles'}
              </h3>
              <p className="text-sm mt-1">
                {searchTerm
                  ? `No se encontró "${searchTerm}"`
                  : 'No hay usuarios para chatear en este momento.'}
              </p>
            </IonText>
          </div>
        )}

        {/* Lista de usuarios */}
        {filteredUsers.length > 0 && (
          <div className="divide-y divide-border/30">
            {filteredUsers
              .filter((u) => u.id !== me?.id) // excluir al propio usuario
              .map((u) => (
                <InternalUserItem
                  key={u.id}
                  user={u}
                  onSelect={handleSelectUser}
                />
              ))}
          </div>
        )}

        {/* Spinner al final si cargando con datos ya visibles */}
        {isLoading && filteredUsers.length > 0 && (
          <div className="flex justify-center p-4">
            <IonSpinner name="crescent" />
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ChatInternoListPage;
