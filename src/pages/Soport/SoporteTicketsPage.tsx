/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonIcon,
} from '@ionic/react';
import {
  list,
  map,
  filterCircleOutline,
  refreshOutline,
  calendarOutline,
  personOutline,
  locationOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { DraggableMarkerExample } from '@/components/Mapconstroller';
import { formatWhatsAppDate } from '@/lib/utils';
import apiService from '@/services/api';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { useLocation } from '@/hooks/useLocation';
import { SoporteTicket } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { getPriorityDot, getStatusStyle } from './helpers/status.helper';



// ─── Page ─────────────────────────────────────────────────────────────────────

type TabKey = 'list' | 'map' | 'filter';

const SoporteTicketsPage: React.FC = () => {
  const history = useHistory();
  const { latitude, longitude } = useLocation();

  const [activeTab, setActiveTab] = useState<TabKey>('list');
  const [agendaTickets, setAgendaTickets] = useState<SoporteTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterMine, setFilterMine] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const getCurrentUserId = (): string | null => {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    const user = JSON.parse(userData);
    return user.id ? String(user.id) : null;
  };

  const fetchTickets = async (mine: boolean, range: DateRange | undefined) => {
    setIsLoading(true);
    try {
      const body: { userId?: string; fechaFin?: string; fechaInicio?: string } = {};
      if (mine) {
        const uid = getCurrentUserId();
        if (uid) body.userId = uid;
      }
      if (range?.from) body.fechaInicio = format(range.from, 'yyyy-MM-dd');
      if (range?.to)   body.fechaFin    = format(range.to,   'yyyy-MM-dd');

      const response: any = await apiService.request('/soport/filterAgenda', {
        method: 'POST',
        data: body,
      });
      setAgendaTickets(response.ticket ?? []);
      setActiveTab('list');
    } catch (error) {
      console.error('Error fetching agenda tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await fetchTickets(filterMine, dateRange);
    event.detail.complete();
  };

  const sorted = [...agendaTickets].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const tabs: { key: TabKey; icon: string; label: string }[] = [
    { key: 'list',   icon: list,                label: 'Lista'   },
    { key: 'map',    icon: map,                 label: 'Mapa'    },
    { key: 'filter', icon: filterCircleOutline, label: 'Filtrar' },
  ];

  return (
    <IonPage>
      {/* ── Header ── */}
      <IonHeader className="ion-no-border">
        <IonToolbar className="border-b border-border bg-card">
          <IonTitle>Agenda</IonTitle>
        </IonToolbar>

        {/* Tabs visuales debajo del header */}
        <div className="flex bg-card border-b border-border">
          {tabs.map(({ key, icon, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition-colors cursor-pointer',
                activeTab === key
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <IonIcon icon={icon} className="text-base" />
              {label}
            </button>
          ))}
        </div>
      </IonHeader>

      {/* ── Content ── */}
      <IonContent className="ion-no-padding">

        {/* Tab: Mapa */}
        {activeTab === 'map' && (
          <div className="h-full w-full">
            <DraggableMarkerExample
              lat={latitude ?? -2.127554}
              lng={longitude ?? -79.934464}
              locations={sorted
                .filter((t) => {
                  const lat = Number.parseFloat(t.latitude ?? '');
                  const lng = Number.parseFloat(t.longitude ?? '');
                  
                  return (
                    !Number.isNaN(lat) && lat >= -90 && lat <= 90 &&
                    !Number.isNaN(lng) && lng >= -180 && lng <= 180 &&
                    (lat !== 0 || lng !== 0)
                  );
                })
                .map((t) => ({
                  id: String(t.id),
                  name: t.subject || 'Sin asunto',
                  lng: Number.parseFloat(t.longitude ?? ''),
                  lat: Number.parseFloat(t.latitude ?? ''),
                  description: `${t.requesterName} - ${t.address || 'Sin dirección'}`,
                  status: t.status
                }))}
            />
          </div>
        )}

        {/* Tab: Lista */}
        {activeTab === 'list' && (
          <>
            <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
              <IonRefresherContent
                pullingIcon={refreshOutline}
                pullingText="Desliza para actualizar"
                refreshingSpinner="circles"
                refreshingText="Actualizando..."
              />
            </IonRefresher>

            {isLoading && (
              <div className="flex justify-center items-center p-8">
                <IonSpinner name="crescent" />
              </div>
            )}

            {!isLoading && sorted.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                <IonIcon icon={calendarOutline} className="text-4xl text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground font-medium">Sin tickets en agenda</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Usa el filtro para buscar tickets
                </p>
              </div>
            )}

            <div className="divide-y divide-border/60 px-0">
              {sorted.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => history.push(`/agenda/${ticket.id}`)}
                  className="w-full text-left flex gap-3 p-4 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  {/* Indicador de prioridad */}
                  <div className="flex flex-col items-center pt-1 shrink-0">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full mt-1',
                        getPriorityDot(ticket.priority)
                      )}
                    />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground leading-tight truncate">
                        {ticket.subject || 'Ticket sin asunto'}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatWhatsAppDate(String(ticket.updatedAt))}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <IonIcon icon={personOutline} className="text-[12px] shrink-0" />
                      <span className="truncate">{ticket.requesterName}</span>
                    </div>

                    {ticket.address && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <IonIcon icon={locationOutline} className="text-[12px] shrink-0" />
                        <span className="truncate">{ticket.address}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                          getStatusStyle(ticket.status)
                        )}
                      >
                        {ticket.status || 'Sin estado'}
                      </span>

                      {ticket.assignedUser?.name && (
                        <Badge variant="outline" className="rounded-full h-4 px-1.5 text-[10px] font-medium">
                          {ticket.assignedUser.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Tab: Filtros */}
        {activeTab === 'filter' && (
          <div className="p-4 flex flex-col gap-4">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Solo mis tickets</p>
                  <p className="text-xs text-muted-foreground">Filtra por usuario asignado</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterMine}
                    onChange={(e) => setFilterMine(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={cn(
                    'w-11 h-6 rounded-full transition-colors',
                    filterMine ? 'bg-primary' : 'bg-muted'
                  )}>
                    <span className={cn(
                      'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform',
                      filterMine ? 'translate-x-5' : 'translate-x-0'
                    )} />
                  </div>
                </label>
              </div>

              <div className="px-4 py-3">
                <p className="text-sm font-medium text-foreground mb-2">Rango de fechas</p>
                <DateRangePicker date={dateRange} setDate={setDateRange} />
              </div>
            </div>

            <button
              type="button"
              onClick={() => fetchTickets(filterMine, dateRange)}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <IonSpinner name="crescent" className="h-4 w-4" />
              ) : (
                <IonIcon icon={filterCircleOutline} className="text-base" />
              )}
              Aplicar filtros
            </button>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default SoporteTicketsPage;
