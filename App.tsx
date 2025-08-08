import {
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import MapScreen from './src/screens/MapScreen';

function App() {
  return <MapScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
