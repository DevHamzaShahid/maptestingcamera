import React, { useEffect, useMemo, useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useUserLocation } from '../hooks/useUserLocation';
import { useDeviceHeading } from '../hooks/useDeviceHeading';
import { useMapCamera } from '../hooks/useMapCamera';
import FOVCone from '../components/FOVCone';

// Dummy car parking locations in Johar Town, Lahore
const PARKINGS = [
  { id: 1, name: 'Emporium Mall Parking', lat: 31.4679, lng: 74.2705, capacity: 200 },
  { id: 2, name: 'Expo Center Parking', lat: 31.4692, lng: 74.2731, capacity: 150 },
  { id: 3, name: 'Johar Town Market Parking', lat: 31.4665, lng: 74.2720, capacity: 80 },
  { id: 4, name: 'Canal Road Parking', lat: 31.4687, lng: 74.2692, capacity: 60 },
  { id: 5, name: 'Shaukat Khanum Parking', lat: 31.4701, lng: 74.2717, capacity: 120 },
];

const initialRegion = {
  latitude: 31.4674,
  longitude: 74.2728,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

function MapScreen() {
  const { location, error } = useUserLocation();
  const heading = useDeviceHeading(true);
  const {
    mapRef,
    isFollowing,
    animateToCamera,
    recenter,
    stopFollowing,
  } = useMapCamera();
  const [selectedParking, setSelectedParking] = useState<number | null>(null);

  // Center map on user location and rotate camera
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

  // Render parking markers
  const renderParkings = () =>
    PARKINGS.map((p) => (
      <Marker
        key={p.id}
        coordinate={{ latitude: p.lat, longitude: p.lng }}
        title={p.name}
        description={`Capacity: ${p.capacity}`}
        onPress={() => setSelectedParking(p.id)}
        pinColor={selectedParking === p.id ? '#FF9800' : '#1976D2'}
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
        {renderParkings()}
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