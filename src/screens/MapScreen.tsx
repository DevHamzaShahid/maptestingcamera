import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import useUserLocation from '../shared/hooks/useUserLocation';
import useDeviceHeading from '../shared/hooks/useDeviceHeading';
import useMapCamera from '../shared/hooks/useMapCamera';
import { restaurants as allRestaurants } from '../shared/restaurants/joharTownRestaurants';
import FovCone from '../shared/components/FovCone';

const GOOGLE_MAPS_APIKEY = 'YOUR_GOOGLE_MAPS_API_KEY';

function haversineMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const R = 6371000;
  const dLat = (b.latitude - a.latitude) * Math.PI / 180;
  const dLon = (b.longitude - a.longitude) * Math.PI / 180;
  const lat1 = a.latitude * Math.PI / 180;
  const lat2 = b.latitude * Math.PI / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const c = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const d = 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
  return R * d;
}

export default function MapScreen() {
  const mapRef = useRef<MapView | null>(null);
  const { location } = useUserLocation();
  const { heading } = useDeviceHeading();
  const { onRegionChange, recenter, followHeading, isFollowing, animateTo } = useMapCamera(mapRef);

  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const restaurants = useMemo(() => allRestaurants, []);
  const destination = useMemo(() => restaurants.find(r => r.id === selectedId) ?? null, [selectedId, restaurants]);

  const initialRegion = useMemo(() => {
    const lat = location?.latitude ?? 31.4697; // Johar Town approx
    const lng = location?.longitude ?? 74.2728;
    return {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  }, [location]);

  useEffect(() => {
    if (!location) return;
    if (isFollowing) {
      animateTo(location.latitude, location.longitude, heading);
    }
  }, [location, heading, isFollowing, animateTo]);

  // Auto-select next nearest when arriving within threshold
  useEffect(() => {
    if (!location || !destination) return;
    const dist = haversineMeters(location, destination);
    if (dist < 35) {
      setVisited(prev => new Set(prev).add(destination.id));
      // find next nearest not visited
      const remaining = restaurants.filter(r => !visited.has(r.id) && r.id !== destination.id);
      if (remaining.length === 0) {
        setSelectedId(null);
        return;
        }
      const next = remaining
        .map(r => ({ r, d: haversineMeters(location, r) }))
        .sort((a, b) => a.d - b.d)[0]?.r;
      if (next) setSelectedId(next.id);
    }
  }, [location, destination, restaurants, visited]);

  const handleRecenter = useCallback(() => {
    recenter();
    if (location) animateTo(location.latitude, location.longitude, heading);
  }, [recenter, location, animateTo, heading]);

  const handleMarkerPress = useCallback((id: string) => {
    setSelectedId(id);
    followHeading(true);
  }, [followHeading]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        onRegionChangeComplete={onRegionChange}
        showsMyLocationButton={false}
        showsUserLocation={false}
      >
        {location && (
          <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} anchor={{ x: 0.5, y: 0.5 }}>
            <FovCone heading={heading} />
          </Marker>
        )}

        {restaurants.map(r => (
          <Marker
            key={r.id}
            coordinate={{ latitude: r.latitude, longitude: r.longitude }}
            title={r.name}
            description={r.description}
            onPress={() => handleMarkerPress(r.id)}
          />
        ))}

        {location && destination && (
          <MapViewDirections
            origin={{ latitude: location.latitude, longitude: location.longitude }}
            destination={{ latitude: destination.latitude, longitude: destination.longitude }}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={5}
            strokeColor="#1D8DF1"
            mode="DRIVING"
            onError={() => {}}
          />
        )}
      </MapView>

      <View style={styles.controls}>
        <TouchableOpacity onPress={handleRecenter} style={styles.button}>
          <Text style={styles.buttonText}>Recenter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  controls: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    gap: 12,
  },
  button: {
    backgroundColor: '#0b5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: { color: 'white', fontWeight: '600' },
});