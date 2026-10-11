import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonButton,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonList,
  IonFooter,
  IonSpinner,
} from '@ionic/react';
import {
  locationOutline,
  timeOutline,
  personOutline,
  saveOutline,
  prismOutline,
  pencil,
  chatbubbleOutline,
} from 'ionicons/icons';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { SoporteTicket } from '../../types';
import { useAuth } from '@/hooks/useAuth';
import apiService from '@/services/api';
import { TicketThread } from './componets/TicketThread';
import { CommentDialog } from './componets/CommentDialog';
import { CommentForm } from './componets/CommentForm';
import { STATUS_OPTIONS } from './constants/soport.constant';
import { cn } from '@/lib/utils';

interface TicketParams {
  id: string;
}

type TabKey = 'detalle' | 'comentario';

// ─── Badge de estado ──────────────────────────────────────────────────────────

const getStatusStyle = (status: string = '') => {
  switch (status?.toLowerCase()) {
    case 'abierto':     return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
    case 'asignado':    return 'bg-blue-500/10 text-blue-600 border-blue-200';
    case 'en_progreso': return 'bg-amber-500/10 text-amber-600 border-amber-200';
    case 'resuelto':    return 'bg-primary/10 text-primary border-primary/30';
    case 'cerrado':     return 'bg-muted text-muted-foreground border-border';
    default:            return 'bg-secondary text-secondary-foreground border-border';
  }
};

const getPriorityStyle = (priority: string='') => {
  switch (priority?.toLowerCase()) {
    case 'alta':  return 'bg-red-500/10 text-red-600 border-red-200';
    case 'media': return 'bg-amber-500/10 text-amber-600 border-amber-200';
    case 'baja':  return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
    default:      return 'bg-secondary text-secondary-foreground border-border';
  }
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const SoporteTicketDetailPage: React.FC = () => {
  const { id } = useParams<TicketParams>();
  const { user } = useAuth();

  const [ticket, setTicket]         = useState<SoporteTicket | null>(null);
  const [comment, setComment]       = useState('');
  const [status, setStatus]         = useState<string>('');
  const [loading, setLoading]       = useState(false);
  const [activeTab, setActiveTab]   = useState<TabKey>('detalle');
  const [commentOpen, setCommentOpen] = useState(false);

  const loadTicket = useCallback(async () => {
    setCommentOpen(false);
    try {
      const data: SoporteTicket = await apiService.request(`/cuenta/getTicket/${id}`);
      const { asignasio, ...rest } = data;
      setTicket({ asignasio, ...rest });
      setStatus(rest.status as string);
    } catch (error) {
      console.error('Error loading ticket:', error);
    }
   
  }, [id]);

  useEffect(() => { loadTicket(); }, [loadTicket]);

  const updateTicket = async () => {
    if (!ticket || !user) return;
    setLoading(true);
    try {
      await apiService.request(`/api/v1/agenda/${id}`, {
        method: 'PUT',
        data: {
          status,
          comment: comment.trim(),
          token: user.accounts.slug,
        },
      });
      if (comment.trim()) setComment('');
      loadTicket();
    } catch (error) {
      console.error('Error updating ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  // canEdit: puede editar si es soporte Y está asignado
  const canEdit =  ticket?.assignedUserId === user.id; //user?.role === 'soporte' && ticket?.assignedUserId === user.id;

  const tabs: { key: TabKey; icon: string; label: string }[] = [
    { key: 'detalle',    icon: locationOutline,    label: 'Detalles'    },
    { key: 'comentario', icon: chatbubbleOutline,  label: 'Comentarios' },
  ];

  // ── Loading ──
  if (!ticket) {
    return (
      <IonPage>
        <IonContent>
          <div className="flex justify-center items-center h-full">
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      {/* ── Header ── */}
      <IonHeader className="ion-no-border">
        <IonToolbar className="border-b border-border bg-card">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/agenda" />
          </IonButtons>
          <IonTitle>Incidencia #{ticket.id}</IonTitle>
        </IonToolbar>

        {/* Tabs visuales */}
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

        {/* Tab: Detalles */}
        {activeTab === 'detalle' && (
          <div className="p-4 flex flex-col gap-4">

            {/* Card: Asunto + badges */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-base font-semibold text-foreground leading-snug flex-1">
                  {ticket.subject || 'Sin asunto'}
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('comentario')}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
                  title="Ir a comentarios"
                >
                  <IonIcon icon={pencil} className="text-base" />
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                  getStatusStyle(ticket.status)
                )}>
                  {ticket.status || 'Sin estado'}
                </span>
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                  getPriorityStyle(ticket.priority ?? '')
                )}>
                  {ticket.priority || 'Sin prioridad'}
                </span>
              </div>

              {ticket.content && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {ticket.content}
                </p>
              )}
            </div>

            {/* Card: Fechas */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fechas</p>
              </div>
              <IonList className="ion-no-padding">
                <IonItem lines="full">
                  <IonIcon icon={timeOutline} slot="start" className="text-muted-foreground" />
                  <IonLabel>
                    <p className="text-xs text-muted-foreground">Creado</p>
                    <h3 className="text-sm">{new Date(ticket.createdAt).toLocaleString()}</h3>
                  </IonLabel>
                </IonItem>
                <IonItem lines="none">
                  <IonIcon icon={timeOutline} slot="start" className="text-muted-foreground" />
                  <IonLabel>
                    <p className="text-xs text-muted-foreground">Visita agendada</p>
                    <h3 className="text-sm">
                      {ticket.visitDate
                        ? new Date(ticket.visitDate).toLocaleString()
                        : 'No agendado'}
                    </h3>
                  </IonLabel>
                </IonItem>
              </IonList>
            </div>

            {/* Card: Personas */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Personas</p>
              </div>
              <IonList className="ion-no-padding">
                <IonItem lines="full">
                  <IonIcon icon={personOutline} slot="start" className="text-muted-foreground" />
                  <IonLabel>
                    <p className="text-xs text-muted-foreground">Solicitante</p>
                    <h3 className="text-sm">{ticket.requesterName}</h3>
                    <p className="text-xs text-muted-foreground">{ticket.requesterPhone}</p>
                  </IonLabel>
                </IonItem>
                <IonItem lines="none">
                  <IonIcon icon={prismOutline} slot="start" className="text-muted-foreground" />
                  <IonLabel>
                    <p className="text-xs text-muted-foreground">Asignado a</p>
                    <h3 className="text-sm">{ticket.assignedUser?.name || 'Sin asignar'}</h3>
                  </IonLabel>
                </IonItem>
              </IonList>
            </div>

            {/* Card: Ubicación */}
            {(ticket.latitude || ticket.address) && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border bg-muted/30">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ubicación</p>
                </div>
                <IonList className="ion-no-padding">
                  {ticket.address && (
                    <IonItem lines={ticket.latitude ? 'full' : 'none'}>
                      <IonIcon icon={locationOutline} slot="start" className="text-muted-foreground" />
                      <IonLabel>
                        <p className="text-xs text-muted-foreground">Dirección</p>
                        <h3 className="text-sm">{ticket.address}</h3>
                      </IonLabel>
                    </IonItem>
                  )}
                  {ticket.latitude && ticket.longitude && (
                    <IonItem lines="none">
                      <IonIcon icon={locationOutline} slot="start" className="text-muted-foreground" />
                      <IonLabel>
                        <p className="text-xs text-muted-foreground">Coordenadas</p>
                        <h3 className="text-sm">{ticket.latitude}, {ticket.longitude}</h3>
                      </IonLabel>
                    </IonItem>
                  )}
                </IonList>
              </div>
            )}
          </div>
        )}

        {/* Tab: Comentarios */}
        {activeTab === 'comentario' && (
          <div className="flex flex-col gap-2 pb-2">
            <div className="flex justify-end px-4 pt-4">
              <CommentDialog isOpen={commentOpen} onOpenChange={setCommentOpen}>
                <CommentForm
                  ticketId={String(id)}
                  onClose={loadTicket}
                  slug={user.accounts.slug}
                />
              </CommentDialog>
            </div>
            <TicketThread key={id} ticket={ticket} />
          </div>
        )}
      </IonContent>

      {/* ── Footer: Actualizar Ticket — fijo, NUNCA dentro del scroll ── */}
      {canEdit && activeTab === 'detalle' && (
        <IonFooter className="ion-no-border">
          <div className="bg-card border-t border-border p-3 flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted-foreground px-1">Actualizar ticket</p>
            <IonList className="rounded-xl border border-border overflow-hidden ion-no-padding bg-background">
              <IonItem lines="full">
                <IonLabel>Estado</IonLabel>
                <IonSelect
                  value={status}
                  onIonChange={(e) => setStatus(e.detail.value)}
                  slot="end"
                  interface="action-sheet"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <IonSelectOption key={opt.id} value={opt.id}>
                      {opt.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem lines="none">
                <IonTextarea
                  value={comment}
                  onIonInput={(e) => setComment(e.detail.value!)}
                  placeholder="Agregar comentario..."
                  rows={2}
                  autoGrow
                />
              </IonItem>
            </IonList>
            <IonButton
              expand="block"
              onClick={updateTicket}
              disabled={loading}
              className="rounded-xl"
            >
              <IonIcon icon={saveOutline} slot="start" />
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </IonButton>
          </div>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default SoporteTicketDetailPage;
