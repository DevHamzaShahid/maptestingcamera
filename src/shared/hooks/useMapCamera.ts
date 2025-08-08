import { useCallback, useRef, useState } from 'react';
import type MapView from 'react-native-maps';

export default function useMapCamera(mapRef: React.RefObject<MapView | null>) {
  const [isFollowing, setIsFollowing] = useState<boolean>(true);
  const userMovedRef = useRef<boolean>(false);

  const onRegionChange = useCallback(() => {
    userMovedRef.current = true;
    setIsFollowing(false);
  }, []);

  const recenter = useCallback(() => {
    userMovedRef.current = false;
    setIsFollowing(true);
  }, []);

  const followHeading = useCallback((on: boolean) => {
    setIsFollowing(on);
  }, []);

  const animateTo = useCallback((latitude: number, longitude: number, heading?: number) => {
    const map = mapRef.current;
    if (!map) return;
    map.animateCamera(
      {
        center: { latitude, longitude },
        pitch: 60,
        heading: heading ?? 0,
        zoom: 17,
      },
      { duration: 600 },
    );
  }, [mapRef]);

  return { onRegionChange, recenter, followHeading, isFollowing, animateTo } as const;
}