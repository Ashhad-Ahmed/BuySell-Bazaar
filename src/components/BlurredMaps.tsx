// BlurredMap.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { getBlurredCoordinates } from '../utils/location'; 

interface Props {
  actualLat: number;
  actualLon: number;
}

const BlurredMap: React.FC<Props> = ({ actualLat, actualLon }) => {
  const blurred = getBlurredCoordinates(actualLat, actualLon);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: blurred.latitude,
          longitude: blurred.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={blurred}
          title="Approximate Location"
          description="This is a general area"
        />

        <Circle
          center={blurred}
          radius={1000} // 1km radius
          strokeWidth={2}
          strokeColor="rgba(0,122,255,0.7)"
          fillColor="rgba(0,122,255,0.2)"
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default BlurredMap;
