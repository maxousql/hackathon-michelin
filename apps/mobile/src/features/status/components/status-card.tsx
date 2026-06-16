import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';
import { useStatus } from '../hooks/use-status';

export function StatusCard() {
  const { data, error, isLoading } = useStatus();
  const isHealthy = data?.status === 'ok';

  return (
    <View style={styles.card}>
      {isLoading ? (
        <ActivityIndicator color={colors.brandBlue} />
      ) : (
        <View
          style={[
            styles.dot,
            isHealthy ? styles.dotHealthy : styles.dotUnavailable,
          ]}
        />
      )}

      <View style={styles.copy}>
        <Text style={styles.label}>
          {isLoading
            ? "Vérification de l'API"
            : isHealthy
              ? 'API opérationnelle'
              : 'API indisponible'}
        </Text>
        <Text style={styles.detail}>
          {data
            ? `${data.service} · version ${data.version}`
            : (error ?? 'Connexion en cours…')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[6],
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.large,
    backgroundColor: colors.surfaceDefault,
  },
  dot: {
    width: 14,
    height: 14,
    marginHorizontal: spacing[1],
    borderRadius: radius.full,
  },
  dotHealthy: { backgroundColor: colors.stateSuccess },
  dotUnavailable: { backgroundColor: colors.stateError },
  copy: { flex: 1, marginLeft: spacing[4] },
  label: {
    marginBottom: spacing[1],
    fontSize: fontSize.bodyLarge,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  detail: {
    fontSize: fontSize.bodySmall,
    color: colors.textSecondary,
  },
});
