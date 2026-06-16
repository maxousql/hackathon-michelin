import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../../../theme';
import { useStatus } from '../hooks/use-status';

export function StatusCard() {
  const { data, error, isLoading } = useStatus();
  const isHealthy = data?.status === 'ok';

  return (
    <View style={styles.card}>
      {isLoading ? (
        <ActivityIndicator color={colors.blue} />
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
    padding: 22,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.lg,
    backgroundColor: colors.cardBg,
  },
  dot: {
    width: 14,
    height: 14,
    marginHorizontal: spacing.xs,
    borderRadius: 7,
  },
  dotHealthy: { backgroundColor: colors.success },
  dotUnavailable: { backgroundColor: colors.error },
  copy: { flex: 1, marginLeft: 18 },
  label: {
    marginBottom: 5,
    color: colors.dark,
    fontSize: 17,
    fontWeight: '800',
  },
  detail: { color: colors.subtle, fontSize: 13, lineHeight: 18 },
});
