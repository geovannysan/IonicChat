/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonSearchbar,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSpinner,
  IonText,
  IonIcon,
  IonFab,
  IonFabButton,
  IonNote
} from '@ionic/react';
import {
  peopleOutline,
} from 'ionicons/icons';
import { useContactStore } from '../stores/useContactStore';
import { formatWhatsAppDate } from '../lib/utils';
import apiService from '../services/api';
import { useHistory } from 'react-router';
import { ArrowDown } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

const ContactListPage: React.FC = () => {
  const {
    contacts,
    fetchContacts,
    hasMore,
    isLoading,
  } = useContactStore();
  const history = useHistory()
  useAuthContext()
  const [searchTerm, setSearchTerm] = useState("");
  // rerender-state-only-in-handlers: pageNumber no dispara re-renders
  const pageNumberRef = useRef(1);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollRef = useRef<any>(null);
  const actualRef = scrollRef
  useEffect(() => {
    // Cargar contactos iniciales
    fetchContacts(1);
  }, [fetchContacts]);

  const sortedContacts = useMemo(() => {
    const allContacts = searchTerm.length >= 3 ? searchResults : contacts;

    return allContacts.filter((contact) => {
      if (searchTerm.length < 3) {
        const searchableText = [
          contact.name,
          contact.number,
          contact.typeContact
        ].join(" ").toLowerCase();

        return searchableText.includes(searchTerm.toLowerCase());
      }
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, searchResults, searchTerm]);

  const handleContactSelect = (contact: any) => {
    history.push(`/contact/${contact.id}`);
  };


  const loadMoreContacts = async (event: CustomEvent) => {
    if (!hasMore || isLoading || searchTerm.length >= 3) {
      (event.target as HTMLIonInfiniteScrollElement).complete();
      return;
    }

    const nextPage = pageNumberRef.current + 1;
    pageNumberRef.current = nextPage;
    await fetchContacts(nextPage);

    (event.target as HTMLIonInfiniteScrollElement).complete();
  };



  const handleSearch = async (term: string) => {
    setSearchTerm(term);

    if (term.length >= 3) {
      try {
        const response: any = await apiService.request(`/Contacto/0/1?search=${term}`);
        const { contactos } = response;
        setSearchResults(contactos || []);
      } catch (error) {
        console.error('Error searching contacts:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };
  const handleScroll = (event: CustomEvent) => {
    const scrollElement = event.target as HTMLElement;
    const scrollTop = scrollElement.scrollTop;
    const scrollHeight = scrollElement.scrollHeight;
    const clientHeight = scrollElement.clientHeight;
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 50);
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollToTop(300);
  };


  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>Contactos</IonTitle>

        </IonToolbar>
      </IonHeader>
      <IonSearchbar
        value={searchTerm}
        onIonInput={(e) => handleSearch(e.detail.value!)}
        placeholder="Buscar contactos... (mín. 3 caracteres)"
        showClearButton="focus"
        debounce={500}
      />
      <IonContent ref={scrollRef} onIonScroll={handleScroll} scrollEvents={true}>




        {sortedContacts.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <IonIcon
              icon={peopleOutline}
              size="large"
              color="medium"
              className="mb-4"
            />
            <IonText color="medium">
              <h3>Sin contactos disponibles</h3>
              <p>
                {searchTerm.length >= 3
                  ? 'No se encontraron contactos con ese criterio'
                  : 'No hay contactos para mostrar'
                }
              </p>
            </IonText>
          </div>
        ) : (
          <IonList ref={actualRef}>
            {sortedContacts.map((contact) => (
              <IonItem
                key={contact.id ?? contact.number}
                button
                onClick={() => handleContactSelect(contact)}
                className="contact-item"
              >



                <IonLabel>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <strong> {contact?.name || 'Usuario'}</strong>


                      <br />
                      <IonNote color="medium" className="ion-text-wrap">
                        {contact.number}
                      </IonNote>

                    </div>

                    <div className="flex flex-col items-end ml-2">
                      <div className="flex items-center gap-1 mb-1">

                        <span className="text-xs text-gray-400">
                          {formatWhatsAppDate(contact.updatedAt)}
                        </span>
                      </div>

                    </div>
                  </div>
                </IonLabel>
                <div className="flex items-center gap-1" slot="end">

                </div>

              </IonItem>
            ))}

          </IonList>

        )}



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


        {isLoading && sortedContacts.length === 0 && (
          <div className="flex justify-center items-center p-4">
            <IonSpinner name="crescent" />
          </div>
        )}

        {isAtBottom && (<IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton size="small" onClick={scrollToTop}>
            <ArrowDown style={{ transform: 'rotate(180deg)' }} />
          </IonFabButton>
        </IonFab>)}
      </IonContent>


    </IonPage>
  );
};

export default ContactListPage;
