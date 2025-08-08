import { useEffect, useState, useRef } from 'react';
import { Magnetometer } from 'react-native-sensors';
import { SensorSubscription } from 'react-native-sensors/lib/typescript/types';

function calculateHeading({ x, y }: { x: number; y: number }) {
  let angle = Math.atan2(y, x) * (180 / Math.PI);
  angle = angle >= 0 ? angle : angle + 360;
  return angle;
}

export function useDeviceHeading(active: boolean = true) {
  const [heading, setHeading] = useState<number>(0);
  const subscription = useRef<SensorSubscription | null>(null);

  useEffect(() => {
    if (!active) {
      if (subscription.current) {
        subscription.current.unsubscribe();
        subscription.current = null;
      }
      return;
    }
    subscription.current = Magnetometer.subscribe(({ x, y }) => {
      setHeading(calculateHeading({ x, y }));
    });
    return () => {
      if (subscription.current) {
        subscription.current.unsubscribe();
        subscription.current = null;
      }
    };
  }, [active]);

  return heading;
}