import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonIcon,
  IonToggle,
  IonList,
  IonNote,
  IonCheckbox,
  IonAvatar,
  IonActionSheet
} from '@ionic/react';
import {
  personOutline,
  mailOutline,
  logOutOutline,
  notificationsOutline
} from 'ionicons/icons';
import { Button } from '@/components/ui/Button';
import { useLocation } from '@/hooks/useLocation';
import { useAuthContext } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';

const UserProfilePage: React.FC = () => {
  const { error } = useLocation();
  const { user, handleLogout, handleCuenta } = useAuthContext()

const [showActionSheet,setShowActionSheet]= useState(false)



  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>Mi Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardContent className="text-center">
            <IonAvatar style={{ margin: '0 auto 16px', width: '80px', height: '80px' }}>
              <img src={`https://ui-avatars.com/api/?name=${user?.name}`} alt={user?.name} />
            </IonAvatar>
            <h2>{user?.name}</h2>
            <div>
              {user?.cuenta.length > 1 && (<Button variant={"destructive"} onClick={()=>setShowActionSheet(prev=>!prev)}>
                Cambiar Cuenta
              </Button>)}
            </div>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Información Personal</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonIcon icon={personOutline} slot="start" />
                <IonLabel>
                  <h3>Nombre</h3>
                  <p>{user?.name || 'Nombre no disponible'}</p>
                </IonLabel>
              </IonItem>

              <IonItem>
                <IonIcon icon={mailOutline} slot="start" />
                <IonLabel>
                  <h3>Email</h3>
                  <p>{user?.email || 'Email no disponible'}</p>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Configuración</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>




              {error && (
                <IonItem>
                  <IonNote color="danger">{error}</IonNote>
                </IonItem>
              )}

              <IonItem>
                <IonIcon icon={notificationsOutline} slot="start" />
                <IonLabel>
                  <h3>Notificaciones</h3>
                  <p>Recibir notificaciones push</p>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <div className='w-full'>
          <Button
            size={"lg"}
            onClick={handleLogout}
            variant={"link"}

          >
            <IonIcon icon={logOutOutline} slot="start" />
            Cerrar Sesión
          </Button>
        </div>
        {user?.cuenta&&(<IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          header={"Empresa: " + user?.accounts.nombre || 'Opciones'}
          buttons={[
            ...user?.cuenta.filter((elm:any)=>elm.accountId!==user.perfil).map((item: any) => 
              
            ({
              text: `Empresa: ${item.account?.nombre}`, // Usamos la propiedad 'adicion' como texto
              handler: () => {
                handleCuenta(item.userId, item.accountId)
              }
            })),
            {
              text: 'Cancelar',
              role: 'cancel'
            }
          ]}
        />)}
      </IonContent>
    </IonPage>
  );
};

export default UserProfilePage;
