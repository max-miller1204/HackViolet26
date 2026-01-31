import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDrinkTracker } from '../../src/hooks/useDrinkTracker';
import { BACMeter } from '../../src/components/safety/BACMeter';
import { STANDARD_DRINKS } from '../../src/utils/bac-calculator';
import { Colors, BorderRadius, Typography, Spacing, Shadows, Gradients } from '../../src/components/ui/theme';

export default function DrinkModal() {
  const {
    currentBAC,
    todaysDrinks,
    isRecording,
    isProcessing,
    error,
    logDrinkByText,
    logQuickDrink,
    removeDrink,
    startVoiceRecording,
    stopVoiceRecording,
    cancelVoiceRecording,
  } = useDrinkTracker();

  const [drinkInput, setDrinkInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const handleLogDrink = async () => {
    if (!drinkInput.trim()) return;

    try {
      await logDrinkByText(drinkInput.trim());
      setDrinkInput('');
    } catch (err) {
      console.error('Failed to log drink:', err);
    }
  };

  const handleVoiceLog = async () => {
    if (isRecording) {
      const uri = await stopVoiceRecording();
      if (uri) {
        // Voice transcription and drink logging handled by hook
      }
    } else {
      await startVoiceRecording();
      // Auto-stop after 5 seconds
      setTimeout(() => {
        stopVoiceRecording();
      }, 5000);
    }
  };

  const quickDrinkOptions: Array<{
    key: keyof typeof STANDARD_DRINKS;
    label: string;
    icon: string;
    color: string;
  }> = [
    { key: 'beer', label: 'Beer', icon: 'beer', color: Colors.caution },
    { key: 'wine', label: 'Wine', icon: 'wine', color: Colors.secondary },
    { key: 'shot', label: 'Shot', icon: 'flask', color: Colors.warning },
    { key: 'cocktail', label: 'Cocktail', icon: 'cafe', color: Colors.primary },
    { key: 'margarita', label: 'Margarita', icon: 'sunny', color: Colors.safe },
    { key: 'longIsland', label: 'Long Island', icon: 'warning', color: Colors.danger },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log a Drink</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* BAC Meter */}
        <View style={styles.bacSection}>
          <BACMeter bacEstimate={currentBAC} />
        </View>

        {/* Quick Log */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Log</Text>
          <View style={styles.quickDrinkGrid}>
            {quickDrinkOptions.map((drink) => (
              <TouchableOpacity
                key={drink.key}
                style={styles.quickDrinkCard}
                onPress={() => logQuickDrink(drink.key)}
              >
                <View style={[styles.quickDrinkIcon, { backgroundColor: drink.color + '20' }]}>
                  <Ionicons name={drink.icon as any} size={24} color={drink.color} />
                </View>
                <Text style={styles.quickDrinkLabel}>{drink.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Or Describe Your Drink</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., Vodka soda with lime"
              placeholderTextColor={Colors.textMuted}
              value={drinkInput}
              onChangeText={setDrinkInput}
              multiline
            />
            <View style={styles.inputActions}>
              <TouchableOpacity
                style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
                onPress={handleVoiceLog}
              >
                <Ionicons
                  name={isRecording ? 'stop' : 'mic'}
                  size={24}
                  color={isRecording ? Colors.white : Colors.secondary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, (!drinkInput.trim() || isProcessing) && styles.submitButtonDisabled]}
                onPress={handleLogDrink}
                disabled={!drinkInput.trim() || isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <>
                    <Ionicons name="add" size={20} color={Colors.white} />
                    <Text style={styles.submitButtonText}>Log</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording... Speak now</Text>
            </View>
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {/* Today's Drinks */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.historyHeader}
            onPress={() => setShowHistory(!showHistory)}
          >
            <Text style={styles.sectionTitle}>Today's Drinks ({todaysDrinks.length})</Text>
            <Ionicons
              name={showHistory ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={Colors.textMuted}
            />
          </TouchableOpacity>

          {showHistory && (
            <View style={styles.drinksList}>
              {todaysDrinks.length === 0 ? (
                <Text style={styles.emptyText}>No drinks logged today</Text>
              ) : (
                todaysDrinks.map((drink) => (
                  <View key={drink.id} style={styles.drinkItem}>
                    <View style={styles.drinkInfo}>
                      <Text style={styles.drinkName}>{drink.name}</Text>
                      <Text style={styles.drinkDetails}>
                        {drink.estimatedOz}oz • {(drink.estimatedABV * 100).toFixed(1)}% ABV
                      </Text>
                    </View>
                    <Text style={styles.drinkTime}>
                      {new Date(drink.loggedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeDrink}
                      onPress={() => removeDrink(drink.id)}
                    >
                      <Ionicons name="close-circle" size={20} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <View style={styles.tipCard}>
            <Ionicons name="water" size={24} color={Colors.primary} />
            <Text style={styles.tipText}>
              Tip: Alternate alcoholic drinks with water to stay hydrated and pace yourself.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: Colors.text,
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  bacSection: {
    padding: Spacing.lg,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    marginBottom: Spacing.md,
  },
  quickDrinkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickDrinkCard: {
    width: '31%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  quickDrinkIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  quickDrinkLabel: {
    color: Colors.text,
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  inputContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  textInput: {
    color: Colors.text,
    fontSize: Typography.base,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButtonActive: {
    backgroundColor: Colors.secondary,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  recordingText: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.sm,
    marginTop: Spacing.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drinksList: {
    marginTop: Spacing.md,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  drinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  drinkInfo: {
    flex: 1,
  },
  drinkName: {
    color: Colors.text,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
  },
  drinkDetails: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    marginTop: 2,
  },
  drinkTime: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    marginRight: Spacing.sm,
  },
  removeDrink: {
    padding: 4,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
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
