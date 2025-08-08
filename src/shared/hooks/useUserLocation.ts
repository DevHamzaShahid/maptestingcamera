import { useCallback, useEffect, useRef, useState } from 'react';
import Geolocation, { GeoPosition } from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid } from 'react-native';

export type SimpleLocation = { latitude: number; longitude: number; accuracy?: number };

export default function useUserLocation() {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [location, setLocation] = useState<SimpleLocation | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const requestPermission = useCallback(async () => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      setHasPermission(auth === 'granted');
      return auth === 'granted';
    }
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    const ok = granted === PermissionsAndroid.RESULTS.GRANTED;
    setHasPermission(ok);
    return ok;
  }, []);

  useEffect(() => {
    (async () => {
      const ok = await requestPermission();
      if (!ok) return;

      watchIdRef.current = Geolocation.watchPosition(
        (pos: GeoPosition) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setLocation({ latitude, longitude, accuracy });
        },
        () => {},
        {
          enableHighAccuracy: true,
          distanceFilter: 5,
          interval: 2000,
          fastestInterval: 1000,
          showsBackgroundLocationIndicator: false,
          useSignificantChanges: false,
        },
      );
    })();

    return () => {
      if (watchIdRef.current != null) {
        Geolocation.clearWatch(watchIdRef.current);
      }
      Geolocation.stopObserving();
    };
  }, [requestPermission]);

  return { location, hasPermission, requestPermission } as const;
}