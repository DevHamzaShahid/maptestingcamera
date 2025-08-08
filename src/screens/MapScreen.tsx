import React, { useEffect, useMemo, useState } from 'react';
import MapView, { Marker, Polyline, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { StatusBar, StyleSheet, useColorScheme, View, TouchableOpacity, Text } from 'react-native';
import { useUserLocation } from '../hooks/useUserLocation';
import { useDeviceHeading } from '../hooks/useDeviceHeading';
import { useMapCamera } from '../hooks/useMapCamera';
import FOVCone from '../components/FOVCone';

// 10 realistic restaurant locations in Johar Town, Lahore
const RESTAURANTS = [
  { id: 1, name: 'Salt Bae Grill', lat: 31.4678, lng: 74.2701, type: 'BBQ', description: 'Famous for steaks.' },
  { id: 2, name: 'Bundu Khan', lat: 31.4685, lng: 74.2732, type: 'Pakistani', description: 'Traditional cuisine.' },
  { id: 3, name: 'Johnny & Jugnu', lat: 31.4659, lng: 74.2715, type: 'Fast Food', description: 'Burgers & wraps.' },
  { id: 4, name: 'Arcadian Cafe', lat: 31.4702, lng: 74.2729, type: 'Continental', description: 'Modern dining.' },
  { id: 5, name: 'Howdy', lat: 31.4667, lng: 74.2751, type: 'Steakhouse', description: 'Western grill.' },
  { id: 6, name: 'Nando’s', lat: 31.4691, lng: 74.2698, type: 'Peri Peri', description: 'Chicken specialists.' },
  { id: 7, name: 'Cafe Barbera', lat: 31.4682, lng: 74.2745, type: 'Cafe', description: 'Italian coffee.' },
  { id: 8, name: 'Pizza Hut', lat: 31.4671, lng: 74.2737, type: 'Pizza', description: 'Global chain.' },
  { id: 9, name: 'Qabail', lat: 31.4662, lng: 74.2709, type: 'Afghani', description: 'Afghan cuisine.' },
  { id: 10, name: 'The Rice Bowl', lat: 31.4700, lng: 74.2712, type: 'Chinese', description: 'Asian fusion.' },
];

function MapScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const { location, error } = useUserLocation();
  const heading = useDeviceHeading(true);
  const {
    mapRef,
    isFollowing,
    animateToLocation,
    animateToCamera,
    recenter,
    stopFollowing,
  } = useMapCamera();
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);

  // Initial region fallback
  const initialRegion = useMemo(() => ({
    latitude: 31.4674,
    longitude: 74.2728,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }), []);

  // Center map on user location when available and following
  useEffect(() => {
    if (location && isFollowing) {
      animateToCamera({
        center: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        heading,
        pitch: 0,
        zoom: 17,
        altitude: 0,
      });
    }
  }, [location, heading, isFollowing, animateToCamera]);

  // Stop following if user drags/zooms map
  const handleRegionChange = () => {
    if (isFollowing) stopFollowing();
  };

  // Render FOV cone at user location
  const renderFOVCone = () => {
    if (!location) return null;
    return (
      <Marker
        coordinate={{ latitude: location.latitude, longitude: location.longitude }}
        anchor={{ x: 0.5, y: 0.5 }}
        tracksViewChanges={false}
        zIndex={999}
        key="user-fov"
      >
        <FOVCone heading={heading} size={32} color="#4285F4" />
      </Marker>
    );
  };

  // Render restaurant markers
  const renderRestaurants = () =>
    RESTAURANTS.map((r) => (
      <Marker
        key={r.id}
        coordinate={{ latitude: r.lat, longitude: r.lng }}
        title={r.name}
        description={r.description}
        onPress={() => setSelectedRestaurant(r.id)}
        pinColor={selectedRestaurant === r.id ? '#FF5722' : '#2E7D32'}
      />
    ));

  // Recenter button
  const renderRecenterButton = () => (
    <TouchableOpacity
      style={styles.recenterBtn}
      onPress={() => {
        if (location) {
          recenter({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      }}
    >
      <Text style={styles.recenterText}>Recenter</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation={false}
        showsMyLocationButton={false}
        rotateEnabled={true}
        pitchEnabled={false}
        toolbarEnabled={false}
        zoomControlEnabled={false}
        minZoomLevel={12}
        maxZoomLevel={20}
      >
        {renderFOVCone()}
        {renderRestaurants()}
      </MapView>
      {renderRecenterButton()}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  recenterBtn: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  recenterText: {
    color: '#4285F4',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'red',
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 6,
    borderRadius: 8,
    marginHorizontal: 24,
  },
});

export default MapScreen;
