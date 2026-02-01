import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { usePlanStore } from '../../src/stores/planStore';
import { SafetyTimeline } from '../../src/components/plan/SafetyTimeline';
import { Colors, BorderRadius, Typography, Spacing, Shadows, Gradients } from '../../src/components/ui/theme';

export default function PlanScreen() {
  const { user } = useAuthStore();
  const { currentPlan, plans, createPlanFromText, setCurrentPlan, deletePlan, isLoading } = usePlanStore();
  const [planInput, setPlanInput] = useState('');
  const [showPlanInput, setShowPlanInput] = useState(!currentPlan);

  const handleCreatePlan = async () => {
    // Demo Mode workaround: Use real ID or fake one
    const userId = user?.id || 'demo-user-123';
    console.log('Button Pressed. Input:', planInput, 'User:', userId);

    if (!planInput.trim()) {
      console.warn('Missing input');
      return;
    }

    try {
      console.log('Calling createPlanFromText with user:', userId);
      const result = await createPlanFromText(planInput.trim(), userId);
      console.log('Plan created successfully:', result);
      setPlanInput('');
      setShowPlanInput(false);
    } catch (error) {
      console.error('Failed to create plan:', error);
    }
  };

  const handleDeletePlan = () => {
    if (currentPlan) {
      deletePlan(currentPlan.id);
      setShowPlanInput(true);
    }
  };

  const examplePlans = [
    'Going to The Rooftop Bar at 8pm, then Luna Lounge at 10pm. Taking Uber, back by 1am.',
    'Dinner at 7pm at Olive & Vine, then drinks at The Speakeasy around 9pm.',
    'Girls night at Starlight Club starting at 10pm, designated driver bringing us home.',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <LinearGradient
            colors={Gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>Night Plan</Text>
            <Text style={styles.headerSubtitle}>
              Plan your evening and stay safe
            </Text>
          </LinearGradient>

          {/* Current Plan or Create New */}
          {currentPlan && !showPlanInput ? (
            <View style={styles.content}>
              <SafetyTimeline plan={currentPlan} />

              <View style={styles.planActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setShowPlanInput(true)}
                >
                  <Ionicons name="create-outline" size={20} color={Colors.primary} />
                  <Text style={styles.editButtonText}>Edit Plan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeletePlan}
                >
                  <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.content}>
              {/* Plan Input */}
              <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>Describe Your Plans</Text>
                <Text style={styles.sectionSubtitle}>
                  Tell us about your night in natural language
                </Text>

                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Going to The Rooftop Bar at 8pm, then Luna Lounge at 10pm..."
                  placeholderTextColor={Colors.textMuted}
                  value={planInput}
                  onChangeText={setPlanInput}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[styles.createButton, !planInput.trim() && styles.createButtonDisabled]}
                  onPress={handleCreatePlan}
                  disabled={!planInput.trim() || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={20} color={Colors.white} />
                      <Text style={styles.createButtonText}>Create Plan with AI</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Example Plans */}
              <View style={styles.examplesSection}>
                <Text style={styles.sectionTitle}>Examples</Text>
                {examplePlans.map((example, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.exampleCard}
                    onPress={() => setPlanInput(example)}
                  >
                    <Ionicons name="bulb-outline" size={20} color={Colors.primary} />
                    <Text style={styles.exampleText}>{example}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Past Plans */}
              {plans.length > 0 && (
                <View style={styles.pastPlansSection}>
                  <Text style={styles.sectionTitle}>Past Plans</Text>
                  {plans
                    .filter((p) => p.id !== currentPlan?.id)
                    .slice(0, 3)
                    .map((plan) => (
                      <TouchableOpacity
                        key={plan.id}
                        style={styles.pastPlanCard}
                        onPress={() => {
                          setCurrentPlan(plan);
                          setShowPlanInput(false);
                        }}
                      >
                        <View style={styles.pastPlanInfo}>
                          <Text style={styles.pastPlanTitle}>{plan.title}</Text>
                          <Text style={styles.pastPlanDate}>
                            {new Date(plan.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
                      </TouchableOpacity>
                    ))}
                </View>
              )}

              {currentPlan && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowPlanInput(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Safety Features Info */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Plan Features</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: Colors.safe + '20' }]}>
                  <Ionicons name="notifications" size={20} color={Colors.safe} />
                </View>
                <Text style={styles.infoItemTitle}>Check-Ins</Text>
                <Text style={styles.infoItemText}>Automated reminders</Text>
              </View>
              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: Colors.primary + '20' }]}>
                  <Ionicons name="location" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.infoItemTitle}>Tracking</Text>
                <Text style={styles.infoItemText}>Share with friends</Text>
              </View>
              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: Colors.secondary + '20' }]}>
                  <Ionicons name="time" size={20} color={Colors.secondary} />
                </View>
                <Text style={styles.infoItemTitle}>Timeline</Text>
                <Text style={styles.infoItemText}>Visual overview</Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
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
  headerTitle: {
    color: Colors.white,
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
  },
  headerSubtitle: {
    color: Colors.white,
    fontSize: Typography.base,
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    padding: Spacing.lg,
  },
  inputSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    marginBottom: Spacing.md,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: Typography.base,
    minHeight: 120,
    marginBottom: Spacing.md,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
  },
  examplesSection: {
    marginBottom: Spacing.xl,
  },
  exampleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  exampleText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    lineHeight: 20,
  },
  pastPlansSection: {
    marginBottom: Spacing.lg,
  },
  pastPlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  pastPlanInfo: {
    flex: 1,
  },
  pastPlanTitle: {
    color: Colors.text,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
  },
  pastPlanDate: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    marginTop: 2,
  },
  planActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '20',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  editButtonText: {
    color: Colors.primary,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.danger + '20',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  deleteButtonText: {
    color: Colors.danger,
    fontSize: Typography.base,
    fontWeight: Typography.medium,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  cancelButtonText: {
    color: Colors.textMuted,
    fontSize: Typography.base,
  },
  infoSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  infoTitle: {
    color: Colors.text,
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    marginBottom: Spacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  infoItem: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  infoItemTitle: {
    color: Colors.text,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
  infoItemText: {
    color: Colors.textMuted,
    fontSize: Typography.xs,
    textAlign: 'center',
    marginTop: 2,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
