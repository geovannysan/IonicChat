/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useState } from 'react';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem, // IonInput removed as it's not needed for userId filter
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonTabBar,
  IonTabButton,
  IonToggle // Import IonToggle
} from '@ionic/react';
import {
  list,
  map,
  ellipsisVerticalOutline,
  filterCircleOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { format } from "date-fns"; // Import format from date-fns
import { DateRange } from "react-day-picker"; // Import DateRange type
import { DraggableMarkerExample } from '@/components/Mapconstroller';
import { formatWhatsAppDate } from '@/lib/utils';
import apiService from '@/services/api';
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useLocation } from '@/hooks/useLocation';
import { SoporteTicket } from '@/types';

// Define the interface for the agenda tickets
interface Contact {
  profilePicURl: string | null;
  id: number;
  name: string;
  number: string;
  typeContact: string;
  isGroup: boolean;
  accountId: string;
  createdAt: string;
  updatedAt: string;
}

interface AssignedUser {
  id: number;
  name: string;
  profile: string;
  email: string;
}

interface AgendaTicket {
  id: number;
  accountId: string;
  contactId: number;
  assignedUserId: number;
  subject: string;
  content: string;
  channel: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  visitDate: string;
  shift: string;
  scheduledFrom: string | null;
  priority: string;
  status: string;
  latitude: string;
  longitude: string;
  address: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  assignedUser: AssignedUser;
  contact: Contact;
}

const SoporteTicketsPage: React.FC = () => {
  const history = useHistory();
  // const {
  //   tickets,
  // } = useTicketStore();

  const { latitude, longitude } = useLocation();

  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'settings'>('list');
  const [agendaTickets, setAgendaTickets] = useState<SoporteTicket[]>([]);
  const [isAgendaLoading, setIsAgendaLoading] = useState(false);

  const [filterMine, setFilterMine] = useState<boolean>(false); // New state for "Mine" filter
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const getCurrentUserId = (): string | null => {
    // Assuming user data is stored in localStorage as 'user' object
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id ? String(user.id) : null;
    }
    return null;
  };

  const fetchAgendaTickets = async (filterByMine: boolean, dateRange: DateRange | undefined) => {
    setIsAgendaLoading(true);
    try {
      const body: { userId?: string; fechaFin?: string; fechaInicio?: string } = {};

      let userIdToFilter: string | null = null;
      if (filterByMine) {
        userIdToFilter = getCurrentUserId();
        if (!userIdToFilter) {
          throw new Error("User ID not found in localStorage for 'Mine' filter.");
        }
        body.userId = userIdToFilter;
      }

      if (dateRange?.from) {
        body.fechaInicio = format(dateRange.from, 'yyyy-MM-dd');
      }
      if (dateRange?.to) {
        body.fechaFin = format(dateRange.to, 'yyyy-MM-dd');
      }
      
      const response: any = await apiService.request('/soport/filterAgenda', {
        method: 'POST',
        data: body
      });
      console.log('Agenda tickets:', response.ticket, 'with filters:', body);
      setAgendaTickets(response.ticket);
      setActiveTab('list')
    } catch (error) {
      console.error('Error fetching agenda tickets:', error);

    } finally {
      setIsAgendaLoading(false);
    }
  };


  // useEffect(() => {
  //   fetchTickets();
  // }, [fetchTickets]);






  const handleTicketSelect = (ticket: SoporteTicket | AgendaTicket) => {
    history.push(`/agenda/${ticket.id}`)
  };


  return (
    <IonPage>
      {/* Contenido dinámico según el estado */}
      <IonContent>
        {activeTab === 'map' && (
          <DraggableMarkerExample
            lat={latitude ?? -2.127554}
            lng={longitude ?? -79.934464}
            locations={agendaTickets.length > 0
              ? agendaTickets
                .filter(t => {
                  const lat = Number.parseFloat(t.latitude ?? "");
                  const lng = Number.parseFloat(t.longitude ?? "");
                  return (
                    !Number.isNaN(lat) && lat >= -90 && lat <= 90 &&
                    !Number.isNaN(lng) && lng >= -180 && lng <= 180 &&
                    (lat !== 0 || lng !== 0) // Opcional: filtrar si vienen en 0,0
                  );
                })
                .map(t => ({
                  id: String(t.id),
                  name: t.subject || 'Sin asunto',
                  lng: Number.parseFloat(t.latitude ?? ""),
                  lat:Number.parseFloat(t.longitude ?? ""),
                  description: `${t.requesterName} - ${t.address || 'Sin dirección'}`
                }))
              : []
            }
          />
        )}

        {activeTab === 'list' && (
          <>
            {isAgendaLoading && <p>Cargando agenda de tickets...</p>}
            {[...agendaTickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())].map((ticket) => (
              <IonItem
                key={ticket.id}
                button
                onClick={() => handleTicketSelect(ticket)}
                className="contact-item"
              >
                <IonLabel>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <strong> {ticket?.subject || 'Ticket sin asunto'}</strong>
                      <br />
                      <IonNote color="medium" className="ion-text-wrap">
                        Solcicitante: {ticket.requesterName}
                      </IonNote>
                      <br />
                      <IonNote color="medium" className="ion-text-wrap">
                        asignado: {ticket?.assignedUser?.name || 'Sin asignar'} - estado:{ticket?.status || 'Sin dirección'}
                      </IonNote>

                    </div>
                    <div className="flex flex-col items-end ml-2">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-gray-400">
                          {formatWhatsAppDate(String(ticket?.updatedAt))}
                        </span>
                      </div>
                    </div>
                  </div>
                </IonLabel>
                <div className="flex items-center gap-1" slot="end">
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <IonIcon icon={ellipsisVerticalOutline} size="small" />
                  </IonButton>
                </div>
              </IonItem>
            ))}
          </>
        )}

        {activeTab === 'settings' && (
          <IonList>
            <IonItem>
              <IonLabel>Filtrar por mis tickets</IonLabel>
              <IonToggle
                checked={filterMine}
                onIonChange={e => setFilterMine(e.detail.checked)}
                slot="end"
              ></IonToggle>
            </IonItem>
            <IonItem>
              <DateRangePicker date={dateRange} setDate={setDateRange}

              />

            </IonItem>
            <IonItem>
              <IonButton expand="block" onClick={() => fetchAgendaTickets(filterMine, dateRange)}>
                Aplicar Filtros
              </IonButton>
            </IonItem>
          </IonList>
        )}      </IonContent>

      {/* Tab Bar Manual (sin rutas) */}
      <IonTabBar slot="top">
        <IonTabButton
          tab="list"
          onClick={() => setActiveTab('list')}
          selected={activeTab === 'list'}
        >
          <IonIcon icon={list} />
          <IonLabel>Lista</IonLabel>
        </IonTabButton>
        <IonTabButton
          tab="map"
          onClick={() => setActiveTab('map')}
          selected={activeTab === 'map'}
        >
          <IonIcon icon={map} />
          <IonLabel>Mapa</IonLabel>
        </IonTabButton>



        <IonTabButton
          tab="settings"
          onClick={() => setActiveTab('settings')}
          selected={activeTab === 'settings'}
        >
          <IonIcon icon={filterCircleOutline} />
          <IonLabel>Filtrar</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonPage>
  );
};

export default SoporteTicketsPage;
