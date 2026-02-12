import { useState, useEffect } from 'react';
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
    loading: false
  });

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = true
  } = options;

  const checkAndRequestPermissions = async () => {
    const status = await Geolocation.checkPermissions();
    if (status.location !== 'granted') {
      const request = await Geolocation.requestPermissions();
      return request.location === 'granted';
    }
    return true;
  };

  const getCurrentPosition = async () => {
    setLocation(prev => ({ ...prev, loading: true, error: null }));

    try {
      const hasPermission = await checkAndRequestPermissions();
      if (!hasPermission) {
        throw new Error('Permisos de ubicación denegados');
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy,
        timeout,
        maximumAge
      });

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        loading: false
      });

      return position;
    } catch (error) {
      setLocation(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error obteniendo ubicación',
        loading: false
      }));
      throw error;
    }
  };

  useEffect(() => {
    if (!watch) return;

    let watchId: string;

    const startWatching = async () => {
      try {
        const hasPermission = await checkAndRequestPermissions();
        if (!hasPermission) {
          setLocation(prev => ({ ...prev, error: 'Permisos de ubicación denegados' }));
          return;
        }

        watchId = await Geolocation.watchPosition(
          { enableHighAccuracy, timeout, maximumAge },
          (position, err) => {
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
                loading: false
              });
            }
          }
        );
      } catch (error) {
        setLocation(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Error monitoreando ubicación',
          loading: false
        }));
      }
    };

    startWatching();

    return () => {
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
      }
    };
  }, [watch, enableHighAccuracy, timeout, maximumAge]);

  return {
    ...location,
    getCurrentPosition,
    refresh: getCurrentPosition
  };
};
