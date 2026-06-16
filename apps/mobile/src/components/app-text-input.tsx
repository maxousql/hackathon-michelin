import { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { colors, radius } from '../theme';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  hintVariant?: 'error' | 'success';
}

export const AppTextInput = forwardRef<TextInput, Props>(
  ({ label, error, hint, hintVariant = 'error', style, ...props }, ref) => {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          ref={ref}
          style={[styles.input, error ? styles.inputError : null, style]}
          placeholderTextColor={colors.borderStrong}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          {...props}
        />
        {error ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : hint ? (
          <Text
            style={[
              styles.hint,
              hintVariant === 'success' && styles.hintSuccess,
            ]}
            accessibilityLiveRegion="polite"
          >
            {hint}
          </Text>
        ) : null}
      </View>
    );
  },
);

AppTextInput.displayName = 'AppTextInput';

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: colors.textPrimary,
  },
  input: {
    padding: 14,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceDefault,
    color: colors.textPrimary,
    fontSize: 15,
  },
  inputError: { borderColor: colors.stateError },
  error: { fontSize: 12, color: colors.stateError },
  hint: { fontSize: 12, color: colors.textSecondary },
  hintSuccess: { color: colors.stateSuccess },
});
