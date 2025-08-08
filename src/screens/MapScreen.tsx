import React, { useEffect, useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { StyleSheet, View, TouchableOpacity, Text, Modal } from 'react-native';
import { useUserLocation } from '../hooks/useUserLocation';
import { useDeviceHeading } from '../hooks/useDeviceHeading';
import { useMapCamera } from '../hooks/useMapCamera';
import FOVCone from '../components/FOVCone';
import { getRouteDirections, ParkingLocation } from '../utils/navigation';

const PARKINGS: ParkingLocation[] = [
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
  const [selectedParking, setSelectedParking] = useState<ParkingLocation | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [navigating, setNavigating] = useState(false);
  const [visited, setVisited] = useState<number[]>([]);

  // Camera follow and rotation
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

  // Start navigation to selected parking
  const startNavigation = async (parking: ParkingLocation) => {
    if (!location) return;
    setNavigating(true);
    setSelectedParking(parking);
    const route = await getRouteDirections(
      { latitude: location.latitude, longitude: location.longitude },
      { latitude: parking.lat, longitude: parking.lng }
    );
    setRouteCoords(route);
  };

  // On arrival, mark as visited and auto-target next nearest
  useEffect(() => {
    if (!navigating || !selectedParking || !location) return;
    const dist = Math.sqrt(
      Math.pow(location.latitude - selectedParking.lat, 2) +
      Math.pow(location.longitude - selectedParking.lng, 2)
    );
    if (dist < 0.0003) { // ~30m
      setVisited((v) => [...v, selectedParking.id]);
      setNavigating(false);
      setRouteCoords([]);
      // Auto-target next nearest
      const remaining = PARKINGS.filter(p => !visited.includes(p.id) && p.id !== selectedParking.id);
      if (remaining.length > 0) {
        const next = remaining.reduce((a, b) => {
          const da = Math.pow(a.lat - location.latitude, 2) + Math.pow(a.lng - location.longitude, 2);
          const db = Math.pow(b.lat - location.latitude, 2) + Math.pow(b.lng - location.longitude, 2);
          return da < db ? a : b;
        });
        startNavigation(next);
      } else {
        setSelectedParking(null);
      }
    }
  }, [location, navigating, selectedParking, visited]);

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
        onPress={() => setSelectedParking(p)}
        pinColor={visited.includes(p.id) ? '#BDBDBD' : '#1976D2'}
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

  // Parking details modal
  const renderParkingModal = () => (
    <Modal visible={!!selectedParking && !navigating} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{selectedParking?.name}</Text>
          <Text>Capacity: {selectedParking?.capacity}</Text>
          <TouchableOpacity
            style={styles.navigateBtn}
            onPress={() => selectedParking && startNavigation(selectedParking)}
          >
            <Text style={styles.navigateText}>Navigate</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedParking(null)}>
            <Text style={{ color: '#888', marginTop: 12 }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
        {routeCoords.length > 1 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#4285F4"
            strokeWidth={5}
          />
        )}
      </MapView>
      {renderRecenterButton()}
      {renderParkingModal()}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  recenterBtn: {
    position: 'absolute', bottom: 32, right: 24, backgroundColor: '#fff', borderRadius: 24,
    paddingVertical: 10, paddingHorizontal: 18, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1,
    shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  recenterText: { color: '#4285F4', fontWeight: 'bold', fontSize: 16 },
  error: {
    position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', color: 'red',
    backgroundColor: 'rgba(255,255,255,0.8)', padding: 6, borderRadius: 8, marginHorizontal: 24,
  },
  modalContainer: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24, minWidth: 260, alignItems: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  navigateBtn: {
    marginTop: 18, backgroundColor: '#4285F4', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24,
  },
  navigateText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default MapScreen;