import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function FovCone({ heading }: { heading: number }) {
  const rotate = `${heading}deg`;
  return (
    <View style={[styles.container, { transform: [{ rotate }] }]}>
      <View style={styles.cone} />
      <View style={styles.dot} />
      <View style={styles.arrow} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cone: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 40,
    borderRightWidth: 40,
    borderBottomWidth: 80,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(66, 133, 244, 0.25)',
    top: -20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4285F4',
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#4285F4',
    top: 12,
  },
});