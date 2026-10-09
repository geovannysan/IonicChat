/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonText,
  IonBackButton,
} from '@ionic/react';
import { ChatLists } from '../components/ui/chat/chat-list';
import './ChatDetailPage.css';
import { useParams } from 'react-router';
import { ContactParams } from './ContactDetailPage';
import apiClient from '@/services/apiClient';

const ChatHistorialPage: React.FC = () => {
  const { id } = useParams<ContactParams>();

  const scrollRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // no-set-state-after-await-in-effect: ref de montaje para proteger loadMores
  // de actualizar el estado después de que el componente se desmonte.
  const isMountedRef = useRef(true);

  // useRef para valores de paginación que no necesitan re-render
  const pageNumberchatRef = useRef(1);
  const hasMoresRef = useRef(false);

  const loandingRef = useRef<boolean>(false);
  const [mensajehistory, setMesagehistory] = useState<any[]>([]);

  const scrollToMiddle = () => {
    timerRef.current = setTimeout(() => {
      if (scrollRef.current?.scrollHeight) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight / 2;
      }
    }, 100);
  };

  const loadMores = async () => {
    if (!hasMoresRef.current) return;

    loandingRef.current = true;
    try {
      await new Promise((res) => setTimeout(res, 1500));
      const nextPage = pageNumberchatRef.current + 1;
      pageNumberchatRef.current = nextPage;

      const { data } = await apiClient.get(`Tickets/ticket/${id}/${nextPage}`);
      if (!isMountedRef.current) return;
      const { messages, hasMore } = data;

      // sort inmutable: nunca mutar el array original
      setMesagehistory(prev => [...messages, ...prev]);
      hasMoresRef.current = hasMore;

      scrollToMiddle();
    } catch (error) {
      console.error('Error cargando más mensajes:', error);
    } finally {
      loandingRef.current = false;
    }
  };

  const handleScroll = (e: any) => {
    if (!hasMoresRef.current || loandingRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMores();
    }
  };
  const cargarInicial = useCallback(async () => {
    loandingRef.current = true;
    try {
      const { data } = await apiClient.get(`Tickets/ticket/${id}/${pageNumberchatRef.current}`);
      const { messages, hasMore } = data;
      // sort inmutable sobre los mensajes recibidos
      setMesagehistory([...messages]);
      hasMoresRef.current = hasMore;
      scrollToMiddle();
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      loandingRef.current = false;
    }
  }, [id]);

  useEffect(() => {



    cargarInicial();

    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // id es estable durante el ciclo de vida de esta página.
    // scrollToMiddle y los setters de useState son estables y no necesitan incluirse.
  }, [id, cargarInicial]);

  // Ordenar de forma inmutable antes de pasarlo al componente
  const sortedMessages = [...mensajehistory].sort(
    (a: any, b: any) =>
      new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/chat" />
          </IonButtons>

          <div className="flex items-center">
            <div>
              <IonTitle size="small" className="text-left" />
              <IonText color="medium" className="text-xs" />
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <ChatLists
          messages={sortedMessages}
          onScroll={handleScroll}
          loading={loandingRef.current}
          scrollRef={scrollRef}
          type={3}
        />
      </IonContent>
    </IonPage>
  );
};

export default ChatHistorialPage;
