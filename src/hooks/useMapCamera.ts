import { useRef, useCallback, useState } from 'react';
import MapView, { Region, Camera } from 'react-native-maps';

export function useMapCamera() {
  const mapRef = useRef<MapView | null>(null);
  const [isFollowing, setIsFollowing] = useState(true);

  const animateToLocation = useCallback((region: Region, duration = 800) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, duration);
    }
  }, []);

  const animateToCamera = useCallback((camera: Partial<Camera>, duration = 800) => {
    if (mapRef.current) {
      mapRef.current.animateCamera(camera, { duration });
    }
  }, []);

  const recenter = useCallback((region: Region) => {
    setIsFollowing(true);
    animateToLocation(region);
  }, [animateToLocation]);

  const stopFollowing = useCallback(() => {
    setIsFollowing(false);
  }, []);

  return {
    mapRef,
    isFollowing,
    animateToLocation,
    animateToCamera,
    recenter,
    stopFollowing,
    setIsFollowing,
  };
}