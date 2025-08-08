import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { magnetometer, accelerometer, SensorTypes, setUpdateIntervalForType } from 'react-native-sensors';
import { map, filter } from 'rxjs/operators';

function toDegrees(rad: number) {
  return rad * (180 / Math.PI);
}

export default function useDeviceHeading() {
  const [heading, setHeading] = useState<number>(0); // degrees 0..360
  const [isActive, setIsActive] = useState<boolean>(false);
  const magSubRef = useRef<any>(null);

  useEffect(() => {
    setUpdateIntervalForType(SensorTypes.magnetometer, 100);
    setUpdateIntervalForType(SensorTypes.accelerometer, 100);
    return () => {
      if (magSubRef.current) magSubRef.current.unsubscribe?.();
    };
  }, []);

  const start = () => {
    if (magSubRef.current) return;
    setIsActive(true);
    magSubRef.current = magnetometer
      .pipe(
        filter(Boolean),
        map(({ x, y }) => {
          // Android/iOS axis differences handled by atan2
          let angle = Math.atan2(y, x);
          let deg = toDegrees(angle);
          deg = (deg + 360) % 360; // normalize
          return deg;
        }),
      )
      .subscribe((deg: number) => {
        setHeading((prev) => {
          // simple low-pass smoothing
          const alpha = 0.15;
          const delta = (((deg - prev + 540) % 360) - 180); // shortest path
          return (prev + alpha * delta + 360) % 360;
        });
      });
  };

  const stop = () => {
    setIsActive(false);
    if (magSubRef.current) {
      magSubRef.current.unsubscribe?.();
      magSubRef.current = null;
    }
  };

  useEffect(() => {
    start();
    return stop;
  }, []);

  return { heading, isActive, start, stop } as const;
}