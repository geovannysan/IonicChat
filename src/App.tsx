import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  isPlatform,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import {
  chatbubbleOutline,
  peopleOutline,
  calendarOutline,
  personOutline,
  chatbubblesOutline
} from 'ionicons/icons';

// Pages
import ChatListPage from './pages/ChatListPage';
import ChatDetailPage from './pages/ChatDetailPage';
import ContactListPage from './pages/ContactListPage';
import ContactDetailPage from './pages/ContactDetailPage';
import SoporteTicketsPage from './pages/SoporteTicketsPage';
import SoporteTicketDetailPage from './pages/SoporteTicketDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import LoginPage from './pages/LoginPage';

// Components
import { PrivateRoute } from './components/PrivateRoute';

// Contexts
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Hooks

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './theme/chat.css';
import { useLocation } from './hooks/useLocation';
import ChatHistorialPage from './pages/ChatHistoryPage';
import { StatusBar, Style } from '@capacitor/status-bar';
import {  useLayoutEffect } from 'react';

const setStatusBarStyle = async () => {
  if (isPlatform('android')) {
    // Cambiar el color de fondo (Solo Android)
    await StatusBar.setBackgroundColor({ color: '#3880ff' }); // Usa tu color hexadecimal

    // Cambiar el estilo de los iconos (Hora, Batería, etc.)
    // Style.Default: Iconos oscuros (para fondos claros)
    // Style.Dark: Iconos claros (para fondos oscuros)
    await StatusBar.setStyle({ style: Style.Dark });
  }
};

// Dentro de tu componente App

setupIonicReact();

const AppContent: React.FC = () => {
  useLocation();
  useAuthContext();
  useLayoutEffect(() => {
    setStatusBarStyle();
  }, []);

  return (
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Rutas públicas */}
        <Route exact path="/login" component={LoginPage} />
        {/* Ruta de chat detail fuera de tabs */}
        <Route exact path="/chat/:id">
          <PrivateRoute>
            <ChatDetailPage />
          </PrivateRoute>
        </Route>
        <Route exact path="/agenda/:id">
          <PrivateRoute>
            <SoporteTicketDetailPage />
          </PrivateRoute>
        </Route>
        <Route exact path="/contact/:id">
          <PrivateRoute>
            <ContactDetailPage />
          </PrivateRoute>
        </Route>
        <Route exact path="/contact/historial/:id">
          <PrivateRoute>
            <ChatHistorialPage />
          </PrivateRoute>
        </Route>
        {/* Rutas privadas con tabs */}
        <Route path="/tabs">
          <PrivateRoute>
            <IonTabs>
              <IonRouterOutlet>
                {/* Chat Routes */}
                <Route exact path="/tabs/chat" component={ChatListPage} />
                {/* Contact Routes */}
                <Route exact path="/tabs/contact" component={ContactListPage} />
                {/* Soporte Tickets Routes */}
                <Route exact path="/tabs/agenda">
                  <PrivateRoute allowedRoles={['soporte', 'admin']}>
                    <SoporteTicketsPage />
                  </PrivateRoute>
                </Route>
                {/* User Profile */}
                <Route exact path="/tabs/user/:id" component={UserProfilePage} />
                <Route exact path="/tabs">
                  <Redirect to="/tabs/chat" />
                </Route>
              </IonRouterOutlet>
              <IonTabBar slot="bottom">
                <IonTabButton tab="chat" href="/tabs/chat">
                  <IonIcon icon={chatbubbleOutline} />
                  <IonLabel>Chat</IonLabel>
                </IonTabButton>
                <IonTabButton tab="contact" href="/tabs/contact">
                  <IonIcon icon={peopleOutline} />
                  <IonLabel>Contactos</IonLabel>
                </IonTabButton>

                <IonTabButton tab="agenda" href="/tabs/agenda">
                  <IonIcon icon={calendarOutline} />
                  <IonLabel>Agenda</IonLabel>
                </IonTabButton>

                <IonTabButton tab="internal-chat" href="/tabs/internal-chat">
                  <IonIcon icon={chatbubblesOutline} />
                  <IonLabel>Chat Interno</IonLabel>
                </IonTabButton>

                <IonTabButton tab="profile" href="/tabs/user/me">
                  <IonIcon icon={personOutline} />
                  <IonLabel>Perfil</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          </PrivateRoute>
        </Route>

        {/* Redirect por defecto */}
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

const App: React.FC = () => (
  <IonApp>
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  </IonApp>
);

export default App;
