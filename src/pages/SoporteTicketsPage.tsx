/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
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
  settings,
  list,
  map,
  ellipsisVerticalOutline
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useTicketStore } from '../stores/useTicketStore';
import { format } from "date-fns"; // Import format from date-fns
import { DateRange } from "react-day-picker"; // Import DateRange type

import type { SoporteTicket } from '../types';
import { DraggableMarkerExample } from '@/components/Mapconstroller';
import { formatWhatsAppDate } from '@/lib/utils';
import apiService from '@/services/api';
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useLocation } from '@/hooks/useLocation';

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
  const {
    tickets,
    fetchTickets,
  } = useTicketStore();

  const { latitude, longitude } = useLocation();

  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'settings'>('list');
  const [agendaTickets, setAgendaTickets] = useState<SoporteTicket[]>(tickets);
  const [isAgendaLoading, setIsAgendaLoading] = useState(false);

  const [filterMine, setFilterMine] = useState<boolean>(false); // New state for "Mine" filter
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const getCurrentUserId = (): string | null => {
    // Assuming user data is stored in localStorage as 'user' object
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.id ? String(user.id) : null;
      } catch (e) {

        return null;
      }
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

      // Validation: If no userId is provided (filterByMine is false), dates must be present
      if (!filterByMine && (!dateRange?.from || !dateRange?.to)) {
        throw new Error("If filtering by 'All' users, both Fecha Inicio and Fecha Fin must be provided.");
      }

      const response: any = await apiService.request('/soport/filterAgenda', {
        method: 'POST',
        data: body
      });
      setAgendaTickets(response.ticket);
      setActiveTab('list')
    } catch (err: any) {

    } finally {
      setIsAgendaLoading(false);
    }
  };


  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    // Initial fetch of all tickets when the list tab is first loaded
    if (activeTab === 'list') {
      fetchAgendaTickets(false, undefined); // Fetch all tickets initially
    }
  }, [activeTab]); // Trigger initial fetch when activeTab changes to 'list'





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
                .filter(t => t.latitude && t.longitude)
                .map(t => ({
                  id: String(t.id),
                  name: t.subject || 'Sin asunto',
                  lng: parseFloat(t.longitude?? "-79.934464"),
                  lat: parseFloat(t.latitude?? "-2.127554"),
                  description: `${t.requesterName} - ${t.address || 'Sin dirección'}`
                }))
              : [
                { id: '1', name: 'Reparación Router', lng: -79.935464, lat: -2.128554, description: 'Juan Pérez - Av. Principal 123' },
                { id: '2', name: 'Instalación Fibra', lng: -79.933464, lat: -2.126554, description: 'María García - Calle Sucre 456' },
                { id: '3', name: 'Soporte Técnico', lng: -79.936464, lat: -2.129554, description: 'Carlos López - Av. Quito 789' },
                { id: '4', name: 'Cambio Modem', lng: -79.932464, lat: -2.125554, description: 'Ana Martínez - Calle Bolívar 321' },
                { id: '5', name: 'Revisión Señal', lng: -79.937464, lat: -2.130554, description: 'Pedro Sánchez - Av. Guayaquil 654' },
                { id: '6', name: 'Instalación TV', lng: -79.931464, lat: -2.124554, description: 'Laura Torres - Calle Flores 987' },
                { id: '7', name: 'Mantenimiento', lng: -79.938464, lat: -2.131554, description: 'Diego Ramírez - Av. Cuenca 147' },
                { id: '8', name: 'Configuración Red', lng: -79.930464, lat: -2.123554, description: 'Sofia Morales - Calle Olmedo 258' },
                { id: '9', name: 'Cambio Cableado', lng: -79.939464, lat: -2.132554, description: 'Miguel Herrera - Av. Loja 369' },
                { id: '10', name: 'Soporte WiFi', lng: -79.929464, lat: -2.122554, description: 'Carmen Ruiz - Calle Rocafuerte 741' }
              ]
            }
          />
        )}

        {activeTab === 'list' && (
          <>
            {isAgendaLoading && <p>Cargando agenda de tickets...</p>}
            {[...tickets,...agendaTickets].map((ticket, index) => (
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
              <DateRangePicker date={dateRange} setDate={setDateRange} />
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
          <IonIcon icon={settings} />
          <IonLabel>Ajustes</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonPage>
  );
};

export default SoporteTicketsPage;
