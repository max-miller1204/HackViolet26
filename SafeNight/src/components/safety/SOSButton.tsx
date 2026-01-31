import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Shadows } from '../ui/theme';

interface SOSButtonProps {
  onTriggerSOS: () => Promise<void>;
  isActive?: boolean;
  size?: 'small' | 'medium' | 'large';
  holdDuration?: number; // ms to hold before triggering
}

export const SOSButton: React.FC<SOSButtonProps> = ({
  onTriggerSOS,
  isActive = false,
  size = 'large',
  holdDuration = 1500,
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const holdTimeout = useRef<NodeJS.Timeout | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation when active
  React.useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isActive, pulseAnim]);

  const getSize = () => {
    switch (size) {
      case 'small':
        return 80;
      case 'medium':
        return 120;
      case 'large':
      default:
        return 160;
    }
  };

  const buttonSize = getSize();
  const iconSize = buttonSize * 0.35;

  const handlePressIn = () => {
    setIsHolding(true);
    setProgress(0);

    // Start vibration pattern
    Vibration.vibrate([0, 50, 50, 50], true);

    // Progress indicator
    const startTime = Date.now();
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / holdDuration, 1);
      setProgress(newProgress);
    }, 16);

    // Trigger SOS after hold duration
    holdTimeout.current = setTimeout(async () => {
      Vibration.cancel();
      Vibration.vibrate([0, 200, 100, 200, 100, 200]);

      try {
        await onTriggerSOS();
      } catch (error) {
        Alert.alert('Error', 'Failed to trigger SOS. Please try again.');
      }

      setIsHolding(false);
      setProgress(0);
    }, holdDuration);
  };

  const handlePressOut = () => {
    // Cancel if released early
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current);
      holdTimeout.current = null;
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    Vibration.cancel();
    setIsHolding(false);
    setProgress(0);
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.buttonWrapper,
          {
            width: buttonSize + 20,
            height: buttonSize + 20,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        {/* Outer glow ring */}
        <View
          style={[
            styles.glowRing,
            {
              width: buttonSize + 20,
              height: buttonSize + 20,
              borderRadius: (buttonSize + 20) / 2,
              opacity: isHolding || isActive ? 0.5 : 0.2,
            },
          ]}
        />

        {/* Progress ring */}
        {isHolding && (
          <View
            style={[
              styles.progressRing,
              {
                width: buttonSize + 10,
                height: buttonSize + 10,
                borderRadius: (buttonSize + 10) / 2,
                borderWidth: 4,
                borderColor: Colors.white,
                opacity: progress,
              },
            ]}
          />
        )}

        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          style={[styles.button, { width: buttonSize, height: buttonSize }]}
        >
          <LinearGradient
            colors={isActive ? ['#FF6B6B', '#DC2626'] : ['#EF4444', '#B91C1C']}
            style={[
              styles.gradient,
              {
                width: buttonSize,
                height: buttonSize,
                borderRadius: buttonSize / 2,
              },
            ]}
          >
            <Ionicons
              name={isActive ? 'alert' : 'warning'}
              size={iconSize}
              color={Colors.white}
            />
            <Text style={[styles.buttonText, { fontSize: size === 'small' ? 14 : 18 }]}>
              {isActive ? 'ACTIVE' : 'SOS'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {!isActive && (
        <Text style={styles.helpText}>
          Hold for {holdDuration / 1000}s to trigger emergency
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    backgroundColor: Colors.sosRed,
  },
  progressRing: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  button: {
    ...Shadows.lg,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow(Colors.sosRed),
  },
  buttonText: {
    color: Colors.white,
    fontWeight: Typography.bold,
    marginTop: 4,
  },
  helpText: {
    color: Colors.textMuted,
    fontSize: Typography.sm,
    marginTop: 12,
    textAlign: 'center',
  },
});
