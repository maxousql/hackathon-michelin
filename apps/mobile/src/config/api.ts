import { Platform } from 'react-native';

const emulatorApiUrl =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3001/api/v1'
    : 'http://localhost:3001/api/v1';

export const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL ?? emulatorApiUrl;

// URL du web app — sur iPhone physique, mettre l'IP locale du Mac
// ex : EXPO_PUBLIC_WEB_URL=http://192.168.1.50:3000
const emulatorWebUrl =
  Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export const webBaseUrl = process.env.EXPO_PUBLIC_WEB_URL ?? emulatorWebUrl;
