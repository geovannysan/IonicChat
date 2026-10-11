import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonIcon,
  IonToggle,
  IonList,
  IonNote,
  IonAvatar,
  IonActionSheet,
} from '@ionic/react';
import {
  personOutline,
  mailOutline,
  logOutOutline,
  notificationsOutline,
} from 'ionicons/icons';
import { User, Settings, Palette } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeCustomizerPanel } from '@/components/ui/ThemeCustomizerPanel';
import { useUserProfile, type ProfileTab } from '@/hooks/useUserProfile';
import { cn } from '@/lib/utils';

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS: { key: ProfileTab; label: string; icon: React.ReactNode }[] = [
  { key: 'perfil',        label: 'Perfil',        icon: <User      className="w-4 h-4" /> },
  { key: 'configuracion', label: 'Config.',        icon: <Settings  className="w-4 h-4" /> },
  { key: 'apariencia',   label: 'Apariencia',    icon: <Palette   className="w-4 h-4" /> },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const UserProfilePage: React.FC = () => {
  const {
    user,
    handleLogout,
    handleCuenta,
    activeTab,
    setActiveTab,
    showAccountSheet,
    setShowAccountSheet,
    otherAccounts,
    activeAccountName,
    updatePushInDB,
    locationError,
  } = useUserProfile();

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="border-b border-border bg-card">
          <IonTitle>Mi perfil</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-no-padding">
        <div className="flex flex-col h-full">

          {/* ── Avatar + nombre ── */}
          <div className="flex flex-col items-center gap-3 px-4 pt-6 pb-4 bg-card border-b border-border">
            <IonAvatar style={{ width: 72, height: 72 }}>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? 'U')}&background=random`}
                alt={user?.name}
              />
            </IonAvatar>
            <div className="text-center">
              <p className="text-base font-semibold text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            {user?.cuenta?.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAccountSheet(true)}
                className="rounded-full text-xs"
              >
                Cambiar cuenta
              </Button>
            )}
          </div>

          {/* ── Tabs ── */}
          <div className="flex border-b border-border bg-card shrink-0">
            {TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors cursor-pointer',
                  activeTab === key
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* ── Contenido del tab ── */}
          <div className="flex-1 overflow-y-auto">

            {/* Tab: Perfil */}
            {activeTab === 'perfil' && (
              <div className="p-4 flex flex-col gap-4">
                <IonList className="rounded-xl border border-border overflow-hidden bg-card ion-no-padding">
                  <IonItem>
                    <IonIcon icon={personOutline} slot="start" />
                    <IonLabel>
                      <h3>Nombre</h3>
                      <p>{user?.name || 'No disponible'}</p>
                    </IonLabel>
                  </IonItem>
                  <IonItem lines="none">
                    <IonIcon icon={mailOutline} slot="start" />
                    <IonLabel>
                      <h3>Email</h3>
                      <p>{user?.email || 'No disponible'}</p>
                    </IonLabel>
                  </IonItem>
                </IonList>

                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full rounded-xl"
                  onClick={handleLogout}
                >
                  <IonIcon icon={logOutOutline} slot="start" className="mr-2" />
                  Cerrar sesión
                </Button>
              </div>
            )}

            {/* Tab: Configuración */}
            {activeTab === 'configuracion' && (
              <div className="p-4 flex flex-col gap-4">
                <IonList className="rounded-xl border border-border overflow-hidden bg-card ion-no-padding">
                  {locationError && (
                    <IonItem>
                      <IonNote color="danger">{locationError}</IonNote>
                    </IonItem>
                  )}
                  <IonItem lines="none">
                    <IonIcon icon={notificationsOutline} slot="start" />
                    <IonLabel>
                      <h3>Notificaciones push</h3>
                      <p>Recibir alertas de nuevos mensajes</p>
                    </IonLabel>
                    <IonToggle
                      slot="end"
                      checked={user?.selectedAccount?.isPush ?? false}
                      onIonChange={(e) => updatePushInDB(e.detail.checked)}
                    />
                  </IonItem>
                </IonList>
              </div>
            )}

            {/* Tab: Apariencia */}
            {activeTab === 'apariencia' && (
              <div className="p-4">
                <ThemeCustomizerPanel />
              </div>
            )}

          </div>
        </div>
      </IonContent>

      {/* ── ActionSheet: cambio de cuenta ── */}
      {user?.cuenta && (
        <IonActionSheet
          isOpen={showAccountSheet}
          onDidDismiss={() => setShowAccountSheet(false)}
          header={`Empresa actual: ${activeAccountName}`}
          buttons={[
            ...otherAccounts.map((item) => ({
              text: `Empresa: ${item.account?.nombre}`,
              handler: () => handleCuenta(item.userId, item.accountId),
            })),
            { text: 'Cancelar', role: 'cancel' },
          ]}
        />
      )}
    </IonPage>
  );
};

export default UserProfilePage;
