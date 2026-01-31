import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, isAfter, isBefore } from 'date-fns';
import { NightPlan, CheckIn, Venue } from '../../types';
import { Colors, BorderRadius, Typography, Spacing, Shadows } from '../ui/theme';

interface SafetyTimelineProps {
  plan: NightPlan;
  onCheckIn?: (checkInId: string) => void;
}

interface TimelineItem {
  id: string;
  type: 'departure' | 'venue' | 'checkin' | 'return';
  time: Date;
  title: string;
  subtitle?: string;
  status: 'completed' | 'current' | 'upcoming' | 'missed';
  venue?: Venue;
  checkIn?: CheckIn;
}

export const SafetyTimeline: React.FC<SafetyTimelineProps> = ({ plan, onCheckIn }) => {
  const now = new Date();

  // Build timeline items
  const buildTimelineItems = (): TimelineItem[] => {
    const items: TimelineItem[] = [];

    // Departure
    items.push({
      id: 'departure',
      type: 'departure',
      time: new Date(plan.departureTime),
      title: 'Departure',
      subtitle: plan.transportation,
      status: isAfter(now, new Date(plan.departureTime)) ? 'completed' : 'upcoming',
    });

    // Venues and check-ins interleaved by time
    const venueItems: TimelineItem[] = plan.venues.map((venue, index) => ({
      id: `venue-${venue.id}`,
      type: 'venue' as const,
      time: new Date(plan.departureTime.getTime() + (index + 1) * 60 * 60 * 1000), // Estimate 1hr apart
      title: venue.name,
      subtitle: venue.type,
      status: 'upcoming' as const,
      venue,
    }));

    const checkInItems: TimelineItem[] = plan.checkIns.map((checkIn) => ({
      id: `checkin-${checkIn.id}`,
      type: 'checkin' as const,
      time: new Date(checkIn.scheduledAt),
      title: 'Safety Check-In',
      subtitle: checkIn.status === 'completed'
        ? `Completed at ${format(new Date(checkIn.completedAt!), 'h:mm a')}`
        : checkIn.status === 'missed'
        ? 'Missed'
        : 'Pending',
      status: checkIn.status === 'completed'
        ? 'completed'
        : checkIn.status === 'missed'
        ? 'missed'
        : isAfter(now, new Date(checkIn.scheduledAt))
        ? 'current'
        : 'upcoming',
      checkIn,
    }));

    // Combine and sort by time
    items.push(...venueItems, ...checkInItems);
    items.sort((a, b) => a.time.getTime() - b.time.getTime());

    // Return
    items.push({
      id: 'return',
      type: 'return',
      time: new Date(plan.returnTime),
      title: 'Return Home',
      subtitle: 'Safe arrival',
      status: isAfter(now, new Date(plan.returnTime)) ? 'completed' : 'upcoming',
    });

    // Update venue statuses based on time
    items.forEach((item, index) => {
      if (item.type === 'venue') {
        const nextItem = items[index + 1];
        if (isAfter(now, item.time)) {
          if (nextItem && isBefore(now, nextItem.time)) {
            item.status = 'current';
          } else {
            item.status = 'completed';
          }
        }
      }
    });

    return items;
  };

  const items = buildTimelineItems();

  const getStatusColor = (status: TimelineItem['status']) => {
    switch (status) {
      case 'completed':
        return Colors.safe;
      case 'current':
        return Colors.primary;
      case 'upcoming':
        return Colors.textMuted;
      case 'missed':
        return Colors.danger;
    }
  };

  const getIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'departure':
        return 'car-outline';
      case 'venue':
        return 'location-outline';
      case 'checkin':
        return 'shield-checkmark-outline';
      case 'return':
        return 'home-outline';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{plan.title}</Text>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: Colors.safe }]} />
          <Text style={styles.statusText}>Active</Text>
        </View>
      </View>

      <ScrollView style={styles.timeline} showsVerticalScrollIndicator={false}>
        {items.map((item, index) => {
          const color = getStatusColor(item.status);
          const isLast = index === items.length - 1;

          return (
            <View key={item.id} style={styles.timelineItem}>
              {/* Time column */}
              <View style={styles.timeColumn}>
                <Text style={[styles.time, { color }]}>
                  {format(item.time, 'h:mm')}
                </Text>
                <Text style={styles.timePeriod}>
                  {format(item.time, 'a')}
                </Text>
              </View>

              {/* Line and dot */}
              <View style={styles.lineColumn}>
                <View style={[styles.dot, { backgroundColor: color }]}>
                  <Ionicons
                    name={getIcon(item.type)}
                    size={16}
                    color={Colors.white}
                  />
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.line,
                      {
                        backgroundColor:
                          item.status === 'completed' ? Colors.safe : Colors.border,
                      },
                    ]}
                  />
                )}
              </View>

              {/* Content */}
              <View style={[styles.content, isLast && styles.contentLast]}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                )}

                {/* Venue details */}
                {item.venue && (
                  <View style={styles.venueDetails}>
                    {item.venue.safetyRating && (
                      <View style={styles.venueTag}>
                        <Ionicons name="star" size={12} color={Colors.caution} />
                        <Text style={styles.venueTagText}>
                          {item.venue.safetyRating.toFixed(1)}
                        </Text>
                      </View>
                    )}
                    {item.venue.womenOwned && (
                      <View style={[styles.venueTag, styles.womenOwnedTag]}>
                        <Text style={styles.venueTagText}>Women-Owned</Text>
                      </View>
                    )}
                    {item.venue.hasSecurityStaff && (
                      <View style={styles.venueTag}>
                        <Ionicons name="shield" size={12} color={Colors.safe} />
                        <Text style={styles.venueTagText}>Security</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Check-in action */}
                {item.type === 'checkin' && item.status === 'current' && onCheckIn && (
                  <View
                    style={styles.checkInButton}
                    onTouchEnd={() => onCheckIn(item.checkIn!.id)}
                  >
                    <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
                    <Text style={styles.checkInText}>Check In Now</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    color: Colors.text,
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.safe + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    color: Colors.safe,
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  timeline: {
    maxHeight: 400,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timeColumn: {
    width: 50,
    alignItems: 'flex-end',
    paddingRight: Spacing.sm,
  },
  time: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  timePeriod: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  lineColumn: {
    width: 40,
    alignItems: 'center',
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: -4,
    marginBottom: -4,
  },
  content: {
    flex: 1,
    paddingBottom: Spacing.lg,
    paddingLeft: Spacing.sm,
  },
  contentLast: {
    paddingBottom: 0,
  },
  itemTitle: {
    color: Colors.text,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
  },
  itemSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  venueDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  venueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  womenOwnedTag: {
    backgroundColor: Colors.secondary + '20',
  },
  venueTagText: {
    color: Colors.textSecondary,
    fontSize: Typography.xs,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
    alignSelf: 'flex-start',
  },
  checkInText: {
    color: Colors.white,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
});
