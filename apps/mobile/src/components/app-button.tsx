import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing } from '../theme';

interface Props {
  title: string;
  loadingTitle?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'outline';
}

export function AppButton({
  title,
  loadingTitle,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={loading ? (loadingTitle ?? title) : title}
      style={({ pressed }) => [
        styles.base,
        variant === 'outline' ? styles.outline : styles.primary,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === 'outline' ? styles.textOutline : styles.textPrimary,
        ]}
      >
        {loading ? (loadingTitle ?? title) : title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primary: { backgroundColor: colors.dark },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  text: { fontSize: 15, fontWeight: '700' },
  textPrimary: { color: colors.yellow },
  textOutline: { color: colors.dark },
});
