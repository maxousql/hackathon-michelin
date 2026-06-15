import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useStatus } from '../hooks/use-status';

export function StatusCard() {
  const { data, error, isLoading } = useStatus();
  const isHealthy = data?.status === 'ok';

  return (
    <View style={styles.card}>
      {isLoading ? (
        <ActivityIndicator color="#2854a1" />
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
            ? 'Vérification de l’API'
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
    borderColor: '#dedbd1',
    borderRadius: 22,
    backgroundColor: '#fffefa',
  },
  dot: {
    width: 14,
    height: 14,
    marginHorizontal: 4,
    borderRadius: 7,
  },
  dotHealthy: {
    backgroundColor: '#179b59',
  },
  dotUnavailable: {
    backgroundColor: '#e65e31',
  },
  copy: {
    flex: 1,
    marginLeft: 18,
  },
  label: {
    marginBottom: 5,
    color: '#151713',
    fontSize: 17,
    fontWeight: '800',
  },
  detail: {
    color: '#686c64',
    fontSize: 13,
    lineHeight: 18,
  },
});
