import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonButton,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonIcon,
  IonList,
  IonTabBar,
  IonTabButton
} from '@ionic/react';
import { locationOutline, timeOutline, personOutline, saveOutline, prismOutline } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SoporteTicket } from '../types';
import { useAuth } from '@/hooks/useAuth';
import apiService from '@/services/api';
interface TicketParams {
  id: string;
}

const SoporteTicketDetailPage: React.FC = () => {
  const { id } = useParams<TicketParams>();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<SoporteTicket | null>(null);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
 const [activeTab, setActiveTab] = useState<'detalle' | 'comentario' | 'historial'>('detalle');
  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    try {
      const data: any = await apiService.request(`/cuenta/getTicket/${id}`);
      const { asignasio, ...rest } = data;

      setTicket(rest);
      setStatus(rest.status);
    } catch (error) {
      console.error('Error loading ticket:', error);
    }
  };

  const updateTicket = async () => {
    if (!ticket || !user) return;

    setLoading(true);
    try {
      await fetch(`/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          comment: comment.trim() || undefined
        })
      });

      if (comment.trim()) {
        setComment('');
      }
      loadTicket();
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
    setLoading(false);
  };

  const canEdit = user?.role === 'soporte' && ticket?.assignedUserId === user.id;

  if (!ticket) {
    return (
      <IonPage>
        <IonContent>
          <div className="ion-padding">Cargando...</div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
          <IonTitle>Insidencia #{ticket.id}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent >
        <IonTabBar >
          <IonTabButton   tab="detalle" onClick={() => setActiveTab('detalle')} selected={activeTab === 'detalle'}>
            <IonIcon icon={locationOutline} slot="start" />
            <IonLabel>Detalles</IonLabel>
          </IonTabButton>
          <IonTabButton tab="comentario" onClick={() => setActiveTab('comentario')} selected={activeTab === 'comentario'}>
            <IonIcon icon={locationOutline} slot="start" />
            <IonLabel>Comentarios</IonLabel>
          </IonTabButton>

        </IonTabBar>
        {activeTab === 'detalle' && <IonCard>
          <IonCardHeader>
            <IonCardTitle>{ticket.subject}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>{ticket.shift}</p>

            <IonList>
              <IonItem>

                <IonLabel>
                  <p>Descripcion</p>
                  <h3>{ticket.content}</h3>

                </IonLabel>

              </IonItem>
              <IonItem>
                <IonIcon icon={timeOutline} slot="start" />
                <IonLabel>
                  <h3>Creado</h3>
                  <p>{new Date(ticket.createdAt).toLocaleString()}</p>
                  <h3>Agendado</h3>
                  <p>{ticket?.visitDate ? new Date(ticket?.visitDate).toLocaleString() : 'No agendado'}</p>
                </IonLabel>
              </IonItem>

              <IonItem>
                <IonIcon icon={personOutline} slot="start" />
                <IonLabel>
                  <h3>Estado</h3>
                  {ticket.status}
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonIcon icon={prismOutline} slot="start" />
                <IonLabel>
                  <h3>Prioridad</h3>
                  {ticket.priority}
                </IonLabel>
              </IonItem>

              {ticket.latitude && ticket.longitude && (
                <IonItem>
                  <IonIcon icon={locationOutline} slot="start" />
                  <IonLabel>
                    <h3>Ubicación</h3>
                    <p>{ticket.latitude}, {ticket.longitude}</p>
                  </IonLabel>
                </IonItem>
              )}
              <IonItem>

                <IonLabel>
                  <h3>Contacto</h3>
                  {ticket.requesterName} - {ticket.requesterPhone}
                </IonLabel>
              </IonItem>
              <IonItem>

                <IonLabel >
                  <h3>Creado</h3>
                  {ticket.assignedUser?.name || 'Sin asignar'}
                </IonLabel>

              </IonItem>
            </IonList>

          </IonCardContent>
        </IonCard>}

        {canEdit && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Actualizar Ticket</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel>Estado</IonLabel>
                <IonSelect value={status} >
                  <IonSelectOption value="pending">Pendiente</IonSelectOption>
                  <IonSelectOption value="in_progress">En Progreso</IonSelectOption>
                  <IonSelectOption value="resolved">Resuelto</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonTextarea
                  value={comment}
                  onIonInput={(e) => setComment(e.detail.value!)}
                  placeholder="Agregar comentario..."
                  rows={3}
                />
              </IonItem>

              <IonButton
                expand="block"
                onClick={updateTicket}
                disabled={loading}
                className="ion-margin-top"
              >
                <IonIcon icon={saveOutline} slot="start" />
                {loading ? 'Guardando...' : 'Actualizar'}
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default SoporteTicketDetailPage;
