import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import apiService from '../services/api';
import { useAuth } from './useAuth';

export const usePushNotifications = () => {
  const { user, isAuth: isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Mutable refs para los handles de Capacitor. Se asignan en setup() y se
    // liberan síncronamente en cleanup, evitando el antipatrón .then(l => l.remove())
    // que no garantiza la remoción antes del próximo render (react-doctor/effect-needs-cleanup).
    let registrationHandle: Awaited<ReturnType<typeof PushNotifications.addListener>> | null = null;
    let registrationErrorHandle: Awaited<ReturnType<typeof PushNotifications.addListener>> | null = null;
    let receivedHandle: Awaited<ReturnType<typeof PushNotifications.addListener>> | null = null;
    let actionHandle: Awaited<ReturnType<typeof PushNotifications.addListener>> | null = null;
    let cancelled = false;

    const setup = async () => {
      try {
        // Registrar listeners primero; si el componente se desmontó antes de que
        // esta Promise resuelva, cleanup() ya habrá puesto cancelled = true y
        // los handles recién asignados se removerán de inmediato.
        registrationHandle = await PushNotifications.addListener(
          'registration',
          async (token) => {
            console.log('Push registration success, token: ' + token.value);
            try {
              await apiService.request(token.value, user.id);
            } catch (error) {
              console.error('Error registering push token:', error);
            }
          }
        );

        registrationErrorHandle = await PushNotifications.addListener(
          'registrationError',
          (error) => {
            console.error('Error on registration: ' + JSON.stringify(error));
          }
        );

        receivedHandle = await PushNotifications.addListener(
          'pushNotificationReceived',
          (notification) => {
            console.log('Push received: ' + JSON.stringify(notification));
          }
        );

        actionHandle = await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (notification) => {
            console.log('Push action performed: ' + JSON.stringify(notification));
            const data = notification.notification.data;
            if (data.type === 'chat') {
              globalThis.location.href = `/tabs/chat/${data.chatId}`;
            } else if (data.type === 'ticket') {
              globalThis.location.href = `/tabs/agenda/${data.ticketId}`;
            }
          }
        );

        // Si el componente se desmontó mientras awaiteábamos, remover de inmediato.
        if (cancelled) {
          registrationHandle.remove();
          registrationErrorHandle.remove();
          receivedHandle.remove();
          actionHandle.remove();
          return;
        }

        // Solicitar permisos y registrar el dispositivo.
        const permission = await PushNotifications.requestPermissions();
        if (!cancelled && permission.receive === 'granted') {
          await PushNotifications.register();
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error);
      }
    };

    setup();

    // Cleanup síncrono: marca cancelled y remueve cualquier handle ya resuelto.
    return () => {
      cancelled = true;
      registrationHandle?.remove();
      registrationErrorHandle?.remove();
      receivedHandle?.remove();
      actionHandle?.remove();
    };
  }, [isAuthenticated, user]);

  return {};
};
