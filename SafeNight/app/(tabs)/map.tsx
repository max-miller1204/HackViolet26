import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Platform,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DEMO_VENUES, getSimulatedCrowdLevel } from '../../src/assets/data/venues';
import { Venue } from '../../src/types';
import { Colors, BorderRadius, Typography, Spacing, Shadows } from '../../src/components/ui/theme';

const { width } = Dimensions.get('window');

type FilterType = 'all' | 'women_owned' | 'security' | 'low_crowd';

export default function MapScreen() {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [venues, setVenues] = useState<Venue[]>(DEMO_VENUES);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Update crowd levels based on current time
  useEffect(() => {
    const updatedVenues = DEMO_VENUES.map((venue) => ({
      ...venue,
      crowdLevel: getSimulatedCrowdLevel(venue),
    }));
    setVenues(updatedVenues);
  }, []);

  // Apply filters
  const filteredVenues = venues.filter((venue) => {
    switch (filter) {
      case 'women_owned':
        return venue.womenOwned;
      case 'security':
        return venue.hasSecurityStaff;
      case 'low_crowd':
        return venue.crowdLevel === 'low';
      default:
        return true;
    }
  });

  const getCrowdColor = (level?: Venue['crowdLevel']) => {
    switch (level) {
      case 'low':
        return Colors.safe;
      case 'medium':
        return Colors.caution;
      case 'high':
        return Colors.danger;
      default:
        return Colors.textMuted;
    }
  };

  const getVenueTypeIcon = (type: Venue['type']): string => {
    switch (type) {
      case 'bar':
        return 'wine';
      case 'club':
        return 'musical-notes';
      case 'restaurant':
        return 'restaurant';
      case 'lounge':
        return 'cafe';
      default:
        return 'location';
    }
  };

  // Render filters component
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'women_owned' && styles.filterChipActive]}
          onPress={() => setFilter('women_owned')}
        >
          <Ionicons name="heart" size={14} color={filter === 'women_owned' ? Colors.white : Colors.secondary} />
          <Text style={[styles.filterText, filter === 'women_owned' && styles.filterTextActive]}>
            Women-Owned
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'security' && styles.filterChipActive]}
          onPress={() => setFilter('security')}
        >
          <Ionicons name="shield" size={14} color={filter === 'security' ? Colors.white : Colors.safe} />
          <Text style={[styles.filterText, filter === 'security' && styles.filterTextActive]}>
            Has Security
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'low_crowd' && styles.filterChipActive]}
          onPress={() => setFilter('low_crowd')}
        >
          <Ionicons name="people" size={14} color={filter === 'low_crowd' ? Colors.white : Colors.primary} />
          <Text style={[styles.filterText, filter === 'low_crowd' && styles.filterTextActive]}>
            Low Crowd
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // Map rendering logic
  const renderMap = () => {
    // Calculate bounds to normalize coordinates
    const lats = venues.map(v => v.latitude);
    const longs = venues.map(v => v.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLong = Math.min(...longs);
    const maxLong = Math.max(...longs);

    // Add padding
    const latPadding = (maxLat - minLat) * 0.2;
    const longPadding = (maxLong - minLong) * 0.2;

    const getPosition = (lat: number, long: number) => {
      const y = ((maxLat + latPadding - lat) / (maxLat - minLat + 2 * latPadding)) * 100;
      const x = ((long - (minLong - longPadding)) / (maxLong - minLong + 2 * longPadding)) * 100;
      return { top: `${y}%`, left: `${x}%` };
    };

    return (
      <View style={styles.mapContainer}>
        {/* Map Background Image - Blacksburg Street Level */}
        <Image
          source={{ uri: 'https://static-maps.yandex.ru/1.x/?lang=en_US&ll=-80.4137,37.2296&z=16&l=map&size=600,600' }}
          style={styles.mapBackground}
          resizeMode="cover"
        />
        <View style={styles.mapOverlay} /> {/* Darken the image */}

        {/* Grid Overlay for Tech Feel */}
        <View style={[styles.gridLine, { opacity: 0.1 }]} />
        <View style={[styles.gridLineHorizontal, { opacity: 0.1 }]} />
        <Text style={styles.mapLabel}>Blacksburg, VA</Text>

        {filteredVenues.map((venue) => {
          const color = getCrowdColor(venue.crowdLevel);
          const size = venue.crowdLevel === 'high' ? 80 : venue.crowdLevel === 'medium' ? 60 : 40;

          return (
            <TouchableOpacity
              key={venue.id}
              style={[styles.mapMarkerContainer, getPosition(venue.latitude, venue.longitude)]}
              onPress={() => setSelectedVenue(venue)}
            >
              {/* Heatmap Glow */}
              <View style={[
                styles.heatGlow,
                {
                  backgroundColor: color,
                  width: size,
                  height: size,
                  opacity: venue.crowdLevel === 'high' ? 0.4 : 0.2
                }
              ]} />

              {/* Pin */}
              <View style={[styles.mapPin, { backgroundColor: color }]}>
                <Ionicons name={getVenueTypeIcon(venue.type) as any} size={12} color={Colors.white} />
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={styles.mapLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
            <Text style={styles.legendText}>High Crowd</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.caution }]} />
            <Text style={styles.legendText}>Medium</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.safe }]} />
            <Text style={styles.legendText}>Low</Text>
          </View>
        </View>
      </View>
    );
  };

  // Venue detail card
  const renderVenueCard = () => {
    if (!selectedVenue) return null;

    return (
      <View style={styles.venueCard}>
        <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedVenue(null)}>
          <Ionicons name="close" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.venueHeader}>
          <View style={[styles.venueIcon, { backgroundColor: getCrowdColor(selectedVenue.crowdLevel) + '20' }]}>
            <Ionicons
              name={getVenueTypeIcon(selectedVenue.type) as any}
              size={24}
              color={getCrowdColor(selectedVenue.crowdLevel)}
            />
          </View>
          <View style={styles.venueHeaderInfo}>
            <Text style={styles.venueName}>{selectedVenue.name}</Text>
            <Text style={styles.venueAddress}>{selectedVenue.address}</Text>
          </View>
        </View>

        <View style={styles.venueTags}>
          {selectedVenue.safetyRating && (
            <View style={styles.venueTag}>
              <Ionicons name="star" size={14} color={Colors.caution} />
              <Text style={styles.venueTagText}>{selectedVenue.safetyRating.toFixed(1)} Safety</Text>
            </View>
          )}
          <View style={[styles.venueTag, { backgroundColor: getCrowdColor(selectedVenue.crowdLevel) + '20' }]}>
            <Ionicons name="people" size={14} color={getCrowdColor(selectedVenue.crowdLevel)} />
            <Text style={[styles.venueTagText, { color: getCrowdColor(selectedVenue.crowdLevel) }]}>
              {selectedVenue.crowdLevel ? selectedVenue.crowdLevel.charAt(0).toUpperCase() + selectedVenue.crowdLevel.slice(1) : 'Unknown'} Crowd
            </Text>
          </View>
          {selectedVenue.womenOwned && (
            <View style={[styles.venueTag, { backgroundColor: Colors.secondary + '20' }]}>
              <Ionicons name="heart" size={14} color={Colors.secondary} />
              <Text style={[styles.venueTagText, { color: Colors.secondary }]}>Women-Owned</Text>
            </View>
          )}
          {selectedVenue.hasSecurityStaff && (
            <View style={[styles.venueTag, { backgroundColor: Colors.safe + '20' }]}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.safe} />
              <Text style={[styles.venueTagText, { color: Colors.safe }]}>Security</Text>
            </View>
          )}
        </View>

        <View style={styles.venueActions}>
          <TouchableOpacity
            style={styles.venueActionButton}
            onPress={() => {
              if (!selectedVenue) return;
              const query = encodeURIComponent(`${selectedVenue.name}, ${selectedVenue.address}`);
              const url = Platform.select({
                ios: `maps:0,0?q=${query}`,
                android: `geo:0,0?q=${query}`,
                web: `https://www.google.com/maps/search/?api=1&query=${query}`
              });
              Linking.openURL(url || '');
            }}
          >
            <Ionicons name="navigate" size={20} color={Colors.white} />
            <Text style={styles.venueActionText}>Directions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.venueActionButton, styles.venueActionSecondary]}
            onPress={() => console.log('Added to plan:', selectedVenue?.name)}
          >
            <Ionicons name="add-circle" size={20} color={Colors.primary} />
            <Text style={[styles.venueActionText, { color: Colors.primary }]}>Add to Plan</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Venue list for all platforms
  const renderVenueList = () => (
    <ScrollView style={styles.venueList} showsVerticalScrollIndicator={false}>
      <View style={styles.listHeader}>
        <Ionicons name="map" size={48} color={Colors.primary} />
        <Text style={styles.listHeaderTitle}>Nearby Venues</Text>
        <Text style={styles.listHeaderSubtitle}>
          {filteredVenues.length} venues found
        </Text>
      </View>

      {filteredVenues.map((venue) => (
        <TouchableOpacity
          key={venue.id}
          style={[
            styles.venueListItem,
            selectedVenue?.id === venue.id && styles.venueListItemSelected,
          ]}
          onPress={() => setSelectedVenue(venue)}
        >
          <View style={[styles.venueListIcon, { backgroundColor: getCrowdColor(venue.crowdLevel) + '20' }]}>
            <Ionicons
              name={getVenueTypeIcon(venue.type) as any}
              size={24}
              color={getCrowdColor(venue.crowdLevel)}
            />
          </View>
          <View style={styles.venueListInfo}>
            <Text style={styles.venueListName}>{venue.name}</Text>
            <Text style={styles.venueListAddress}>{venue.address}</Text>
            <View style={styles.venueListTags}>
              {venue.safetyRating && (
                <View style={styles.venueListTag}>
                  <Ionicons name="star" size={10} color={Colors.caution} />
                  <Text style={styles.venueListTagText}>{venue.safetyRating.toFixed(1)}</Text>
                </View>
              )}
              {venue.womenOwned && (
                <View style={[styles.venueListTag, { backgroundColor: Colors.secondary + '20' }]}>
                  <Text style={[styles.venueListTagText, { color: Colors.secondary }]}>Women-Owned</Text>
                </View>
              )}
              {venue.hasSecurityStaff && (
                <View style={[styles.venueListTag, { backgroundColor: Colors.safe + '20' }]}>
                  <Text style={[styles.venueListTagText, { color: Colors.safe }]}>Security</Text>
                </View>
              )}
              <View style={[styles.venueListTag, { backgroundColor: getCrowdColor(venue.crowdLevel) + '20' }]}>
                <Text style={[styles.venueListTagText, { color: getCrowdColor(venue.crowdLevel) }]}>
                  {venue.crowdLevel ? venue.crowdLevel.charAt(0).toUpperCase() + venue.crowdLevel.slice(1) : 'Unknown'}
                </Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      ))}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        {renderFilters()}
        <TouchableOpacity
          style={styles.viewToggle}
          onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
        >
          <Ionicons name={viewMode === 'list' ? 'map' : 'list'} size={20} color={Colors.primary} />
          <Text style={styles.viewToggleText}>{viewMode === 'list' ? 'Map' : 'List'}</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'list' ? renderVenueList() : renderMap()}
      {renderVenueCard()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... existing styles ...
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.md,
    backgroundColor: Colors.background,
    zIndex: 10,
  },
  viewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    marginLeft: Spacing.sm,
    ...Shadows.sm,
  },
  viewToggleText: {
    color: Colors.primary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e', // Dark map bg
    position: 'relative',
    overflow: 'hidden',
    margin: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8, // Make image visible
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  gridLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2,
    backgroundColor: Colors.textMuted,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 2,
    backgroundColor: Colors.textMuted,
  },
  mapLabel: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    color: Colors.textMuted,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    opacity: 0.2,
  },
  mapMarkerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100, // Touch target
    height: 100,
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  heatGlow: {
    position: 'absolute',
    borderRadius: 999,
  },
  mapPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    zIndex: 2,
    ...Shadows.md,
  },
  mapLegend: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: Colors.text,
    fontSize: Typography.xs,
  },
  // ... rest of existing styles ...
  filtersContainer: {
    flex: 1, // Allow filters to take available space
    paddingTop: Spacing.md,
    backgroundColor: Colors.background,
  },
  // ... include all previous styles below this comment ...
  filters: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    ...Shadows.sm,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    color: Colors.text,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  filterTextActive: {
    color: Colors.white,
  },
  venueList: {
    flex: 1,
  },
  listHeader: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  listHeaderTitle: {
    color: Colors.text,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    marginTop: Spacing.md,
  },
  listHeaderSubtitle: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    marginTop: Spacing.xs,
  },
  venueListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  venueListItemSelected: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  venueListIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueListInfo: {
    flex: 1,
  },
  venueListName: {
    color: Colors.text,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  venueListAddress: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    marginTop: 2,
  },
  venueListTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  venueListTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 2,
  },
  venueListTagText: {
    color: Colors.textSecondary,
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  venueCard: {
    position: 'absolute',
    bottom: 20,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 1,
  },
  venueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  venueIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  venueHeaderInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  venueName: {
    color: Colors.text,
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
  },
  venueAddress: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    marginTop: 2,
  },
  venueTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  venueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  venueTagText: {
    color: Colors.textSecondary,
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  venueActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  venueActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  venueActionSecondary: {
    backgroundColor: Colors.primary + '20',
  },
  venueActionText: {
    color: Colors.white,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  bottomPadding: {
    height: 100,
  },
});
