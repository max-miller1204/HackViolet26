import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BACEstimate } from '../../types';
import {
  Colors,
  BorderRadius,
  Typography,
  Spacing,
  Shadows,
} from '../ui/theme';
import { formatBAC, formatTimeToSober, getBACColor } from '../../utils/bac-calculator';

interface BACMeterProps {
  bacEstimate: BACEstimate | null;
  compact?: boolean;
}

export const BACMeter: React.FC<BACMeterProps> = ({ bacEstimate, compact = false }) => {
  if (!bacEstimate) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <View style={styles.emptyState}>
          <Ionicons name="wine-outline" size={24} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No drinks logged</Text>
        </View>
      </View>
    );
  }

  const { bac, timeToSober, safetyLevel, recommendation } = bacEstimate;
  const color = getBACColor(bac);

  // Calculate fill percentage (max BAC shown is 0.20)
  const fillPercentage = Math.min(bac / 0.2, 1) * 100;

  // Get icon based on safety level
  const getIcon = () => {
    switch (safetyLevel) {
      case 'safe':
        return 'checkmark-circle';
      case 'caution':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'danger':
        return 'skull';
      default:
        return 'help-circle';
    }
  };

  // Get gradient colors based on safety level
  const getGradientColors = (): readonly [string, string] => {
    switch (safetyLevel) {
      case 'safe':
        return ['#22C55E', '#16A34A'];
      case 'caution':
        return ['#EAB308', '#CA8A04'];
      case 'warning':
        return ['#F97316', '#EA580C'];
      case 'danger':
        return ['#EF4444', '#DC2626'];
      default:
        return ['#6B7280', '#4B5563'];
    }
  };

  if (compact) {
    return (
      <View style={[styles.container, styles.containerCompact]}>
        <View style={styles.compactContent}>
          <View style={[styles.indicator, { backgroundColor: color }]} />
          <Text style={styles.compactBAC}>{formatBAC(bac)}</Text>
          <Text style={styles.compactTime}>
            {timeToSober > 0 ? formatTimeToSober(timeToSober) : 'Sober'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Blood Alcohol Level</Text>
        <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
          <Ionicons name={getIcon()} size={16} color={color} />
          <Text style={[styles.statusText, { color }]}>
            {safetyLevel.charAt(0).toUpperCase() + safetyLevel.slice(1)}
          </Text>
        </View>
      </View>

      {/* BAC Display */}
      <View style={styles.bacDisplay}>
        <Text style={[styles.bacValue, { color }]}>{formatBAC(bac)}</Text>
        <Text style={styles.bacLabel}>BAC</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${fillPercentage}%` }]}
          />
        </View>
        {/* Markers */}
        <View style={styles.markers}>
          <View style={styles.marker}>
            <Text style={styles.markerText}>0.00</Text>
          </View>
          <View style={[styles.marker, styles.markerLegal]}>
            <View style={styles.markerLine} />
            <Text style={styles.markerText}>0.08</Text>
            <Text style={styles.markerLabel}>Legal</Text>
          </View>
          <View style={styles.marker}>
            <Text style={styles.markerText}>0.20</Text>
          </View>
        </View>
      </View>

      {/* Time to Sober */}
      <View style={styles.timeSection}>
        <Ionicons name="time-outline" size={20} color={Colors.textSecondary} />
        <Text style={styles.timeLabel}>Time to sober:</Text>
        <Text style={styles.timeValue}>
          {timeToSober > 0 ? formatTimeToSober(timeToSober) : 'Already sober'}
        </Text>
      </View>

      {/* Recommendation */}
      <View style={[styles.recommendation, { borderLeftColor: color }]}>
        <Text style={styles.recommendationText}>{recommendation}</Text>
      </View>
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
  containerCompact: {
    padding: Spacing.sm,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: Typography.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.text,
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  bacDisplay: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  bacValue: {
    fontSize: 48,
    fontWeight: Typography.bold,
  },
  bacLabel: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressTrack: {
    height: 12,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  markers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  marker: {
    alignItems: 'center',
  },
  markerLegal: {
    position: 'absolute',
    left: '40%',
    alignItems: 'center',
  },
  markerLine: {
    width: 2,
    height: 8,
    backgroundColor: Colors.warning,
    marginBottom: 2,
  },
  markerText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
  },
  markerLabel: {
    color: Colors.warning,
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
  },
  timeLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
  },
  timeValue: {
    color: Colors.text,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    marginLeft: 'auto',
  },
  recommendation: {
    borderLeftWidth: 3,
    paddingLeft: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  recommendationText: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 20,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  compactBAC: {
    color: Colors.text,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  compactTime: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    marginLeft: 'auto',
  },
});
