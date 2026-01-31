import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Venue } from '../../types';
import { Colors, Shadows } from '../ui/theme';

interface NativeMapProps {
  venues: Venue[];
  selectedVenueId?: string;
  onVenueSelect: (venue: Venue) => void;
  getCrowdColor: (level?: Venue['crowdLevel']) => string;
  getVenueTypeIcon: (type: Venue['type']) => string;
}

// Dark map style for night mode
const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1a1025' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8B5CF6' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1025' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#251B35' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#352B45' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0F0A1A' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#251B35' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a2e1a' }] },
];

export const NativeMap: React.FC<NativeMapProps> = ({
  venues,
  selectedVenueId,
  onVenueSelect,
  getCrowdColor,
  getVenueTypeIcon,
}) => {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 37.7849,
        longitude: -122.4094,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      }}
      customMapStyle={mapStyle}
    >
      {venues.map((venue) => (
        <Marker
          key={venue.id}
          coordinate={{
            latitude: venue.latitude,
            longitude: venue.longitude,
          }}
          onPress={() => onVenueSelect(venue)}
        >
          <View style={[styles.markerContainer, selectedVenueId === venue.id && styles.markerSelected]}>
            <View style={[styles.marker, { backgroundColor: getCrowdColor(venue.crowdLevel) }]}>
              <Ionicons name={getVenueTypeIcon(venue.type) as any} size={16} color={Colors.white} />
            </View>
            {venue.womenOwned && (
              <View style={styles.womenOwnedBadge}>
                <Ionicons name="heart" size={8} color={Colors.secondary} />
              </View>
            )}
          </View>
        </Marker>
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerSelected: {
    transform: [{ scale: 1.2 }],
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadows.md,
  },
  womenOwnedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
