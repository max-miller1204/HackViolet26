// SafeNight Theme - Women-first safety app
// Primary colors: Purple/Pink gradients for warmth and safety

export const Colors = {
  // Primary brand colors
  primary: '#8B5CF6', // Purple
  primaryLight: '#A78BFA',
  primaryDark: '#7C3AED',

  // Secondary accent
  secondary: '#EC4899', // Pink
  secondaryLight: '#F472B6',
  secondaryDark: '#DB2777',

  // Safety status colors
  safe: '#22C55E', // Green
  caution: '#EAB308', // Yellow
  warning: '#F97316', // Orange
  danger: '#EF4444', // Red

  // SOS specific
  sosRed: '#DC2626',
  sosRedDark: '#B91C1C',

  // Neutrals
  background: '#0F0A1A', // Deep purple-black
  backgroundLight: '#1A1025',
  surface: '#251B35',
  surfaceLight: '#352B45',

  // Text
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',

  // Borders
  border: '#3F3554',
  borderLight: '#4F4564',

  // Others
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,

  // Font weights
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  }),
};

// Common style patterns
export const CommonStyles = {
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.md,
  },
  button: {
    primary: {
      backgroundColor: Colors.primary,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.sm + 4,
      paddingHorizontal: Spacing.lg,
    },
    secondary: {
      backgroundColor: Colors.surface,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: Colors.primary,
      paddingVertical: Spacing.sm + 4,
      paddingHorizontal: Spacing.lg,
    },
    danger: {
      backgroundColor: Colors.sosRed,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.sm + 4,
      paddingHorizontal: Spacing.lg,
    },
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    color: Colors.text,
    fontSize: Typography.base,
  },
  heading: {
    color: Colors.text,
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
  },
  subheading: {
    color: Colors.textSecondary,
    fontSize: Typography.base,
  },
};

// Gradient definitions for LinearGradient
export const Gradients = {
  primary: ['#8B5CF6', '#EC4899'] as const,
  primaryVertical: ['#A78BFA', '#7C3AED'] as const,
  danger: ['#EF4444', '#DC2626'] as const,
  safe: ['#22C55E', '#16A34A'] as const,
  surface: ['#251B35', '#1A1025'] as const,
};
