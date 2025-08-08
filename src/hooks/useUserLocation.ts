import { useEffect, useState, useRef } from 'react';
import Geolocation, { GeoPosition } from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid } from 'react-native';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    async function requestPermission() {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    }

    let isMounted = true;
    requestPermission().then((granted) => {
      if (!granted) {
        setError('Location permission denied');
        return;
      }
      watchId.current = Geolocation.watchPosition(
        (pos: GeoPosition) => {
          if (isMounted) {
            setLocation({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            });
            setError(null);
          }
        },
        (err) => {
          if (isMounted) setError(err.message);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 2,
          interval: 2000,
          fastestInterval: 1000,
        },
      );
    });
    return () => {
      isMounted = false;
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return { location, error };
}