import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { usePlanStore } from '../../src/stores/planStore';
import { useDrinkStore } from '../../src/stores/drinkStore';
import { useSOSStore } from '../../src/stores/sosStore';
import { useSOSMode } from '../../src/hooks/useSOSMode';
import { SOSButton } from '../../src/components/safety/SOSButton';
import { BACMeter } from '../../src/components/safety/BACMeter';
import { SOSEmergencyScreen } from '../../src/components/safety/SOSEmergencyScreen';
import { SafetyTimeline } from '../../src/components/plan/SafetyTimeline';
import { Colors, BorderRadius, Typography, Spacing, Shadows, Gradients } from '../../src/components/ui/theme';

export default function HomeScreen() {
  const { user, loadDemoUser } = useAuthStore();
  const { currentPlan, completeCheckIn } = usePlanStore();
  const { currentBAC } = useDrinkStore();
  const { isSOSActive, currentSOS } = useSOSStore();
  const { triggerSOS, resolveSOS, cancelSOS } = useSOSMode();

  // Load demo user on mount for hackathon
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user]);

  const handleCheckIn = (checkInId: string) => {
    if (currentPlan) {
      completeCheckIn(currentPlan.id, checkInId);
    }
  };

  // Show SOS emergency screen when active
  if (isSOSActive && currentSOS && user) {
    return (
      <SOSEmergencyScreen
        sosEvent={currentSOS}
        emergencyContacts={user.emergencyContacts}
        onResolve={resolveSOS}
        onCancel={cancelSOS}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>
                Hey, {user?.displayName?.split(' ')[0] || 'there'}
              </Text>
              <Text style={styles.subGreeting}>Stay safe tonight</Text>
            </View>
            <TouchableOpacity style={styles.chatButton} onPress={() => router.push('/(modals)/chat')}>
              <Ionicons name="chatbubble-ellipses" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* SOS Button Section */}
        <View style={styles.sosSection}>
          <SOSButton onTriggerSOS={triggerSOS} isActive={isSOSActive} size="large" />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/(modals)/drink')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: Colors.secondary + '20' }]}>
              <Ionicons name="wine" size={24} color={Colors.secondary} />
            </View>
            <Text style={styles.quickActionText}>Log Drink</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/plan')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: Colors.primary + '20' }]}>
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.quickActionText}>New Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/map')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: Colors.safe + '20' }]}>
              <Ionicons name="location" size={24} color={Colors.safe} />
            </View>
            <Text style={styles.quickActionText}>Find Venues</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/social')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: Colors.caution + '20' }]}>
              <Ionicons name="car" size={24} color={Colors.caution} />
            </View>
            <Text style={styles.quickActionText}>Find Ride</Text>
          </TouchableOpacity>
        </View>

        {/* BAC Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Drink Status</Text>
            <TouchableOpacity onPress={() => router.push('/(modals)/drink')}>
              <Text style={styles.sectionLink}>Log Drink</Text>
            </TouchableOpacity>
          </View>
          <BACMeter bacEstimate={currentBAC} />
        </View>

        {/* Active Plan */}
        {currentPlan && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tonight's Plan</Text>
              <TouchableOpacity onPress={() => router.push('/plan')}>
                <Text style={styles.sectionLink}>Edit</Text>
              </TouchableOpacity>
            </View>
            <SafetyTimeline plan={currentPlan} onCheckIn={handleCheckIn} />
          </View>
        )}

        {/* No Plan Prompt */}
        {!currentPlan && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.createPlanCard}
              onPress={() => router.push('/plan')}
            >
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
                style={styles.createPlanGradient}
              >
                <Ionicons name="calendar-outline" size={40} color={Colors.primary} />
                <Text style={styles.createPlanTitle}>Create a Night Plan</Text>
                <Text style={styles.createPlanSubtitle}>
                  Set check-ins, track venues, and stay safe
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Safety Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Reminder</Text>
          <View style={styles.tipCard}>
            <Ionicons name="shield-checkmark" size={24} color={Colors.safe} />
            <Text style={styles.tipText}>
              Always share your location with a trusted friend before heading out. Your emergency contacts can be notified instantly with one tap.
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: Colors.white,
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
  },
  subGreeting: {
    color: Colors.white,
    fontSize: Typography.base,
    opacity: 0.9,
    marginTop: 4,
  },
  chatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginTop: -Spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  quickAction: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    color: Colors.textSecondary,
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
  },
  sectionLink: {
    color: Colors.primary,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  createPlanCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  createPlanGradient: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  createPlanTitle: {
    color: Colors.text,
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    marginTop: Spacing.md,
  },
  createPlanSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    alignItems: 'flex-start',
    ...Shadows.sm,
  },
  tipText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 20,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
