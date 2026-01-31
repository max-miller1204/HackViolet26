import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SOSEvent, EmergencyContact } from '../../types';
import { Colors, BorderRadius, Typography, Spacing } from '../ui/theme';
import { getSOSBlockchainInfo } from '../../stores/sosStore';

interface SOSEmergencyScreenProps {
  sosEvent: SOSEvent;
  emergencyContacts: EmergencyContact[];
  onResolve: () => void;
  onCancel: () => void;
}

export const SOSEmergencyScreen: React.FC<SOSEmergencyScreenProps> = ({
  sosEvent,
  emergencyContacts,
  onResolve,
  onCancel,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const call911 = () => {
    Linking.openURL('tel:911');
  };

  const callContact = (contact: EmergencyContact) => {
    Linking.openURL(`tel:${contact.phone}`);
  };

  const shareLocation = () => {
    if (sosEvent.location) {
      const url = `https://maps.google.com/?q=${sosEvent.location.latitude},${sosEvent.location.longitude}`;
      Linking.openURL(url);
    } else {
      Alert.alert('Location Unavailable', 'Could not get your current location.');
    }
  };

  const getTriggerText = () => {
    switch (sosEvent.trigger) {
      case 'button':
        return 'SOS Button Pressed';
      case 'code_word':
        return 'Code Word Detected';
      case 'missed_checkin':
        return 'Missed Check-In';
      case 'auto_escalate':
        return 'Auto-Escalated';
      default:
        return 'Emergency Triggered';
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#7F1D1D', '#450A0A']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Animated.View
            style={[styles.alertIcon, { transform: [{ scale: pulseAnim }] }]}
          >
            <Ionicons name="alert-circle" size={80} color={Colors.white} />
          </Animated.View>
          <Text style={styles.title}>EMERGENCY ACTIVE</Text>
          <Text style={styles.subtitle}>{getTriggerText()}</Text>
        </View>

        {/* Location Info */}
        {sosEvent.location && (
          <TouchableOpacity style={styles.locationCard} onPress={shareLocation}>
            <Ionicons name="location" size={24} color={Colors.sosRed} />
            <View style={styles.locationText}>
              <Text style={styles.locationLabel}>Your Location</Text>
              <Text style={styles.locationAddress}>
                {sosEvent.location.address ||
                  `${sosEvent.location.latitude.toFixed(4)}, ${sosEvent.location.longitude.toFixed(4)}`}
              </Text>
            </View>
            <Ionicons name="share-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.emergencyButton} onPress={call911}>
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.emergencyButtonGradient}
            >
              <Ionicons name="call" size={32} color={Colors.white} />
              <Text style={styles.emergencyButtonText}>Call 911</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.contactsSection}>
          <Text style={styles.sectionTitle}>Emergency Contacts Notified</Text>
          {emergencyContacts.map((contact) => (
            <TouchableOpacity
              key={contact.id}
              style={styles.contactCard}
              onPress={() => callContact(contact)}
            >
              <View style={styles.contactAvatar}>
                <Text style={styles.contactInitial}>
                  {contact.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactRelation}>{contact.relationship}</Text>
              </View>
              <Ionicons name="call-outline" size={24} color={Colors.primary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Blockchain Verification */}
        {sosEvent.blockchainHash && (
          <View style={styles.blockchainCard}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.safe} />
            <Text style={styles.blockchainText}>
              Event logged to blockchain
            </Text>
            <Text style={styles.blockchainHash}>
              {sosEvent.blockchainHash.substring(0, 12)}...
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.resolveButton} onPress={onResolve}>
            <Text style={styles.resolveButtonText}>I'm Safe - End Emergency</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>False Alarm - Cancel</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  alertIcon: {
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.white,
    fontSize: Typography['3xl'],
    fontWeight: Typography.bold,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.white,
    fontSize: Typography.lg,
    opacity: 0.8,
    marginTop: Spacing.xs,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  locationText: {
    flex: 1,
  },
  locationLabel: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
  },
  locationAddress: {
    color: Colors.black,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
  },
  actionsSection: {
    marginBottom: Spacing.lg,
  },
  emergencyButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  emergencyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  emergencyButtonText: {
    color: Colors.white,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
  },
  contactsSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    marginBottom: Spacing.md,
    opacity: 0.9,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInitial: {
    color: Colors.white,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: Colors.white,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  contactRelation: {
    color: Colors.white,
    fontSize: Typography.sm,
    opacity: 0.7,
  },
  blockchainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  blockchainText: {
    color: Colors.white,
    fontSize: Typography.sm,
    flex: 1,
  },
  blockchainHash: {
    color: Colors.safe,
    fontSize: Typography.xs,
    fontFamily: 'monospace',
  },
  bottomActions: {
    marginTop: 'auto',
    gap: Spacing.md,
  },
  resolveButton: {
    backgroundColor: Colors.safe,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  resolveButtonText: {
    color: Colors.white,
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: Typography.base,
    opacity: 0.8,
  },
});
