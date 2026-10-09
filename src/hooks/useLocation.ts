import { useState, useEffect, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

export const useLocation = (options: UseLocationOptions = {}) => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
  });

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = true,
  } = options;

  const checkAndRequestPermissions = useCallback(async () => {
    const status = await Geolocation.checkPermissions();
    if (status.location !== 'granted') {
      const request = await Geolocation.requestPermissions();
      return request.location === 'granted';
    }
    return true;
  }, []);

  // isMounted flag: evita setear estado en componente desmontado (race condition)
  const getCurrentPosition = useCallback(async () => {
    let isMounted = true;
    setLocation(prev => ({ ...prev, loading: true, error: null }));

    try {
      const hasPermission = await checkAndRequestPermissions();
      if (!hasPermission) {
        throw new Error('Permisos de ubicación denegados');
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy,
        timeout,
        maximumAge,
      });

      if (isMounted) {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      }

      return position;
    } catch (error) {
      if (isMounted) {
        setLocation(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Error obteniendo ubicación',
          loading: false,
        }));
      }
      throw error;
    } finally {
      // Evitar que futuros seteos lleguen si el componente se desmontó
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      isMounted = false;
    }
  }, [checkAndRequestPermissions, enableHighAccuracy, timeout, maximumAge]);

  useEffect(() => {
    if (!watch) return;

    let watchId: string;
    let active = true;

    const startWatching = async () => {
      try {
        const hasPermission = await checkAndRequestPermissions();
        if (!hasPermission) {
          if (active) {
            setLocation(prev => ({ ...prev, error: 'Permisos de ubicación denegados' }));
          }
          return;
        }

        watchId = await Geolocation.watchPosition(
          { enableHighAccuracy, timeout, maximumAge },
          (position, err) => {
            if (!active) return;
            if (err) {
              setLocation(prev => ({ ...prev, error: err.message }));
              return;
            }
            if (position) {
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                error: null,
                loading: false,
              });
            }
          }
        );
      } catch (error) {
        if (active) {
          setLocation(prev => ({
            ...prev,
            error: error instanceof Error ? error.message : 'Error monitoreando ubicación',
            loading: false,
          }));
        }
      }
    };

    startWatching();

    return () => {
      active = false;
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
      }
    };
  }, [watch, enableHighAccuracy, timeout, maximumAge, checkAndRequestPermissions]);

  return {
    ...location,
    getCurrentPosition,
    refresh: getCurrentPosition,
  };
};
