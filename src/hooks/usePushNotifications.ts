import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import apiService from '../services/api';
import { useAuth } from './useAuth';

export const usePushNotifications = () => {
  const { user, isAuth:isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const initPushNotifications = async () => {
      try {
        // Solicitar permisos
        const permission = await PushNotifications.requestPermissions();
        
        if (permission.receive === 'granted') {
          await PushNotifications.register();
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    // Listener para token de registro
    const registrationListener = PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token: ' + token.value);
      
      try {
        await apiService.request(token.value, user.id);
      } catch (error) {
        console.error('Error registering push token:', error);
      }
    });

    // Listener para errores de registro
    const registrationErrorListener = PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Listener para notificaciones recibidas (app en foreground)
    const receivedListener = PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received: ' + JSON.stringify(notification));
      // Aquí puedes mostrar una notificación local o actualizar la UI
    });

    // Listener para notificaciones tocadas (app en background)
    const actionListener = PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed: ' + JSON.stringify(notification));
      
      const data = notification.notification.data;
      
      // Navegar según el tipo de notificación
      if (data.type === 'chat') {
        globalThis.location.href = `/tabs/chat/${data.chatId}`;
      } else if (data.type === 'ticket') {
        globalThis.location.href = `/tabs/agenda/${data.ticketId}`;
      }
    });

    initPushNotifications();

    // Cleanup
    return () => {
    };
  }, [isAuthenticated, user]);

  return {
    // Funciones adicionales si las necesitas
  };
};
