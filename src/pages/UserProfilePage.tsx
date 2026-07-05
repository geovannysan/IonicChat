import {
  IonContent,
  IonPage,
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
import { useState } from 'react';
import apiService from '@/services/api';

const UserProfilePage: React.FC = () => {
  const { error } = useLocation();
  const { user, setUser, handleLogout, handleCuenta } = useAuthContext()

  const [showActionSheet, setShowActionSheet] = useState(false)

  // Función auxiliar para evitar código duplicado
  const updatePushInDB = async (pushId: boolean) => {

    try {
    const account = user.selectedAccount;

     if (account) {
      //account.id, {
    //     method: "PUT",
    //     data: JSON.stringify({ isPush: pushId }) 
        await apiService.UpdatePerfil(account.id, { isPush: pushId })
      const newuser = await apiService.updateUser(user.id, { chatperfliid: account.accountId });
      localStorage.setItem("user", JSON.stringify(newuser))
      setUser(newuser)
    }
    } catch (error) {
      console.error("Error updating push setting:", error);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardContent className="text-center">
            <IonAvatar style={{ margin: '0 auto 16px', width: '80px', height: '80px' }}>
              <img src={`https://ui-avatars.com/api/?name=${user?.name}`} alt={user?.name} />
            </IonAvatar>
            <h2>{user?.name}</h2>
            <div>
              {user?.cuenta.length > 1 && (<Button className='bg-destructive text-destructive-foreground hover:bg-destructive/90' variant={"destructive"} onClick={() => setShowActionSheet(prev => !prev)}>
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
                <IonToggle slot='end' onIonChange={(e) => updatePushInDB(e.target.checked)} checked={user.selectedAccount.isPush}></IonToggle>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <div className='w-full'>
          <Button
            className='bg-destructive'
            size={"lg"}
            onClick={handleLogout}
            variant={"destructive"}

          >
            <IonIcon icon={logOutOutline} slot="start" />
            Cerrar Sesión
          </Button>
        </div>
        {user?.cuenta && (<IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          header={"Empresa Actual: " + user?.cuenta.find((elm: { accountId: string; }) => elm.accountId == user.perfil).account?.nombre || 'Opciones'}
          buttons={[
            ...user.cuenta.filter((elm: { accountId: string; }) => elm.accountId !== user.perfil).map((item: { userId: number; accountId: string; account: { nombre: string; } }) =>
            ({
              text: `Empresa: ${item.account?.nombre}`,
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
