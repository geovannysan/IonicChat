/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  IonSpinner,
  IonBackButton,
} from '@ionic/react';
import { ChatLists } from '../components/ui/chat/chat-list';
import './ChatDetailPage.css'
import { useParams } from 'react-router';
import { ContactParams } from './ContactDetailPage';
import apiClient from '@/services/apiClient';

const ChatHistorialPage: React.FC = () => {
  const { id } = useParams<ContactParams>()

  const scrollRef = useRef<any>(null);


  const [loading, setLoading] = useState(false);
  const [pageNumberchat, setPageNumberchat] = useState(1);
  const [hasMores, setMore] = useState(false)
  const [mensajehistory, setMesagehistory] = useState([])

  const loadMores = async () => {
    if (!hasMores) return
    setLoading(true)
    await new Promise((res) => setTimeout(res, 1500));
    setPageNumberchat((prevState) => prevState + 1);
    const { data } = await apiClient.get("Tickets/ticket/" + id + "/" + (pageNumberchat + 1))

    const { messages, hasMore } = data
    setMesagehistory([...messages, ...mensajehistory] as any)
    setMore(hasMore)
    setLoading(false)
    setTimeout(() => {
      if (scrollRef.current && scrollRef.current.scrollHeight) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight / 2;
      }
    }, 100);
  };

  const handleScroll = (e: any) => {
    if (!hasMores || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMores();
    }
  };

  useEffect(() => {
    const nuevos = async () => {
      const { data } = await apiClient.get("Tickets/ticket/" + id + "/" + (pageNumberchat))

      const { messages, hasMore } = data
      setMesagehistory([...messages, ...mensajehistory] as any)
      setMore(hasMore)
      setTimeout(() => {
        if (scrollRef.current && scrollRef.current.scrollHeight) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight / 2;
        }
      }, 100);
    }
    nuevos()
  }, [])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/chat" />
          </IonButtons>

          <div className="flex items-center">

            <div>
              <IonTitle size="small" className="text-left">

              </IonTitle>
              <IonText color="medium" className="text-xs">

              </IonText>
            </div>
          </div>

        </IonToolbar>
      </IonHeader>
      <IonContent>
        <ChatLists
          messages={mensajehistory.sort((a: any, b: any) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())}
          onScroll={handleScroll}
          loading={loading}
          scrollRef={scrollRef}
        />
      </IonContent>





      {/* ... IonModal ... */}
    </IonPage>
  );
};

export default ChatHistorialPage;
