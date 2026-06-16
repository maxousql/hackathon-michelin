import { StatusBar } from 'expo-status-bar';

import { LandingScreen } from './src/features/landing/components/landing-screen';

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <LandingScreen />
    </>
  );
}
