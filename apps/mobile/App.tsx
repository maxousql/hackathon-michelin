import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StatusCard } from './src/features/status/components/status-card';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>HACKATHON MICHELIN</Text>
        <Text style={styles.title}>Le même produit, partout.</Text>
        <Text style={styles.introduction}>
          Cette application Expo partage ses contrats et son client HTTP avec le
          frontend Next.js.
        </Text>

        <StatusCard />

        <View style={styles.feature}>
          <Text style={styles.featureIndex}>01</Text>
          <Text style={styles.featureTitle}>iOS et Android</Text>
          <Text style={styles.featureCopy}>
            Une base React Native commune, prête à être distribuée avec EAS.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2f0e8',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  eyebrow: {
    marginBottom: 16,
    color: '#2854a1',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    maxWidth: 330,
    marginBottom: 20,
    color: '#151713',
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -3,
    lineHeight: 55,
  },
  introduction: {
    maxWidth: 340,
    marginBottom: 36,
    color: '#50544c',
    fontSize: 18,
    lineHeight: 28,
  },
  feature: {
    minHeight: 210,
    marginTop: 16,
    padding: 24,
    borderRadius: 22,
    backgroundColor: '#151713',
  },
  featureIndex: {
    marginBottom: 56,
    color: '#ffd200',
    fontFamily: 'monospace',
    fontSize: 14,
  },
  featureTitle: {
    marginBottom: 10,
    color: '#f7f5ed',
    fontSize: 24,
    fontWeight: '800',
  },
  featureCopy: {
    color: '#b9bdb3',
    fontSize: 16,
    lineHeight: 24,
  },
});
