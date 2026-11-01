/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useLayoutEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonFooter,
  IonButtons,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  useIonViewWillLeave,
  useIonViewDidEnter,
} from '@ionic/react';
import {
  arrowBack,
  sendOutline,
  chatbubblesOutline,
  refreshOutline,
} from 'ionicons/icons';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';
import { useAuthContext } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useInternalConversation } from '../hooks/useInternalConversation';
import { ChatBubble } from '../components/ChatBubble';
import { ChatDateSeparator } from '../components/ChatDateSeparator';
import { ConversationSkeleton } from '../components/ChatSkeleton';
import { getInitials } from '../helpers/chat.helpers';
import type { ChatInternalUser } from '../models/chat-message.interface';

interface RouteParams {
  myId: string;
  otherId: string;
}

/**
 * ChatInternoConversationPage
 *
 * Conversación interna entre dos usuarios.
 * Recibe los IDs por parámetros de ruta y el objeto "otherUser"
 * por navigation state (opcional, para mostrar nombre/avatar sin fetch extra).
 */
const ChatInternoConversationPage: React.FC = () => {
  const history = useHistory();
  const { myId, otherId } = useParams<RouteParams>();
  const location = useLocation<{ otherUser?: ChatInternalUser }>();
  const { user: me, socket } = useAuthContext();

  // IDs resueltos: primero desde ruta, fallback al usuario autenticado
  const myUserId = Number(myId) || me?.id;
  const otherUserId = Number(otherId);

  // Metadatos del otro usuario: desde state de navegación o placeholder
  const otherUser: ChatInternalUser = location.state?.otherUser ?? {
    id: otherUserId,
    name: `Usuario ${otherUserId}`,
    email: '',
    profile: '',
  };

  const {
    messages,
    isLoading,
    isSending,
    hasMore,
    error,
    inputValue,
    setInputValue,
    sendMessage,
    loadMore,
    refresh,
  } = useInternalConversation(myUserId, otherUserId, socket);

  // ── Auto-scroll al último mensaje ─────────────────────────────────────────
  const contentRef = useRef<HTMLIonContentElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll al fondo al recibir mensajes nuevos (sólo si el usuario ya estaba abajo)
  const isAtBottomRef = useRef(true);

  const scrollToBottom = (smooth = false) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'instant',
    });
  };

  // Scroll inicial y tras enviar
  useLayoutEffect(() => {
    if (messages.length > 0 && isAtBottomRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  // Scroll al montar la vista (primera carga)
  useIonViewDidEnter(() => {
    setTimeout(() => scrollToBottom(), 150);
  });

  // ── Botón atrás nativo Android ─────────────────────────────────────────────
  const backButtonListenerRef = useRef<any>(null);

  useIonViewDidEnter(() => {
    App.addListener('backButton', () => {
      history.goBack();
    }).then((h) => {
      backButtonListenerRef.current = h;
    });
  });

  useIonViewWillLeave(() => {
    backButtonListenerRef.current?.remove();
  });

  // ── Infinite scroll hacia arriba (mensajes más antiguos) ──────────────────
  const handleInfiniteScroll = async (event: CustomEvent) => {
    await loadMore();
    (event.target as HTMLIonInfiniteScrollElement).complete();
  };

  // ── Refresh (ion-refresher) ────────────────────────────────────────────────
  const handleRefresh = async (event: CustomEvent) => {
    await refresh();
    event.detail.complete();
    scrollToBottom();
  };

  // ── Enviar con Enter (sin Shift) ───────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;
    isAtBottomRef.current = true; // forzar scroll al fondo tras enviar
    await sendMessage();
    setTimeout(() => scrollToBottom(true), 50);
  };

  // ── Renderizado de lista con separadores de fecha ─────────────────────────
  const renderMessages = () => {
    return messages.map((msg, idx) => {
      const prevMsg = messages[idx - 1];
      const currentDay = new Date(msg.createdAt).toDateString();
      const prevDay = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null;
      const showDateSep = currentDay !== prevDay;

      return (
        <React.Fragment key={msg.id}>
          {showDateSep && <ChatDateSeparator isoDate={msg.createdAt} />}
          <ChatBubble message={msg} isMine={msg.userId === myUserId} />
        </React.Fragment>
      );
    });
  };

  const initials = getInitials(otherUser.name);
  const canSend = inputValue.trim().length > 0 && !isSending;

  return (
    <IonPage>
      {/* ── Header ── */}
      <IonHeader className="ion-no-border">
        <IonToolbar className="border-b border-border bg-card">
          <IonButtons slot="start">
            <IonButton
              fill="clear"
              onClick={() => history.goBack()}
              aria-label="Volver"
            >
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>

          {/* Avatar + nombre del otro usuario */}
          <div className="flex items-center gap-3 px-1">
            <Avatar className="w-8 h-8 border border-border shadow-sm shrink-0">

              <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">
                {initials}
              </AvatarFallback>

            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-foreground leading-tight truncate">
                {otherUser.name}
              </span>
              {otherUser.email && (
                <span className="text-[11px] text-muted-foreground leading-tight truncate">
                  {otherUser.email}
                </span>
              )}
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      {/* ── Mensajes ── */}
      <IonContent
        ref={contentRef}
        className="ion-no-padding"
        scrollEvents
        onIonScroll={(e: CustomEvent) => {
          const detail = e.detail;
          // Detectar si el usuario está cerca del fondo
          const { scrollTop, scrollHeight } = detail;
          if (contentRef.current) {
            // Usamos aproximación: si está a menos de 80px del fondo = "al fondo"
            isAtBottomRef.current = scrollHeight - scrollTop < 80;
          }
        }}
      >
        {/* Pull-to-refresh */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={refreshOutline}
            pullingText="Soltar para actualizar"
            refreshingSpinner="circles"
          />
        </IonRefresher>

        {/* Infinite scroll ARRIBA (mensajes más antiguos) */}
        <IonInfiniteScroll
          position="top"
          disabled={!hasMore}
          onIonInfinite={handleInfiniteScroll}
          threshold="10%"
        >
          <IonInfiniteScrollContent
            loadingSpinner="crescent"
            loadingText="Cargando mensajes anteriores..."
          />
        </IonInfiniteScroll>

        {/* Skeleton carga inicial */}
        {isLoading && messages.length === 0 && <ConversationSkeleton />}

        {/* Error state */}
        {error && messages.length === 0 && (
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
        {!isLoading && !error && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <IonIcon
              icon={chatbubblesOutline}
              className="text-5xl text-muted-foreground mb-3"
            />
            <IonText color="medium">
              <p className="text-sm font-semibold">Sé el primero en escribir</p>
              <p className="text-xs mt-1">
                Inicia la conversación con {otherUser.name}
              </p>
            </IonText>
          </div>
        )}

        {/* Mensajes + separadores de fecha */}
        <div className="flex flex-col pb-2 pt-2">
          {renderMessages()}
        </div>

        {/* Ancla para auto-scroll al fondo */}
        <div ref={messagesEndRef} />
      </IonContent>

      {/* ── Footer: input + botón enviar ── */}
      <IonFooter className="ion-no-border">
        <div className="bg-card border-t border-border px-3 py-2">
          <div className="flex items-end gap-2">
            {/* Textarea autoexpandible */}
            <div className="flex-1 bg-muted/40 border border-border/60 rounded-2xl px-3 py-2">
              <textarea
                rows={1}
                placeholder="Escribe un mensaje..."
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  // Autoexpansión
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
                }}
                onKeyDown={handleKeyDown}
                disabled={isSending}
                aria-label="Mensaje"
                className={cn(
                  'w-full bg-transparent text-sm text-foreground',
                  'placeholder:text-muted-foreground outline-none resize-none',
                  'leading-snug max-h-24 overflow-y-auto',
                )}
                style={{ minHeight: '22px' }}
              />
            </div>

            {/* Botón enviar */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Enviar mensaje"
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-full shrink-0',
                'transition-all duration-150',
                canSend
                  ? 'bg-primary text-primary-foreground shadow-md active:scale-95'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              )}
            >
              {isSending ? (
                <IonSpinner name="crescent" className="w-4 h-4" />
              ) : (
                <IonIcon icon={sendOutline} className="text-base" />
              )}
            </button>
          </div>
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default ChatInternoConversationPage;
