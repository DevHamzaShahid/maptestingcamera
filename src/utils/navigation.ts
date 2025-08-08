export interface ParkingLocation {
  id: number;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
}

// Mock: returns a straight line polyline, but ready for real API integration
export async function getRouteDirections(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): Promise<{ latitude: number; longitude: number }[]> {
  // TODO: Integrate with Google Directions API for real driving route
  return [from, to];
}