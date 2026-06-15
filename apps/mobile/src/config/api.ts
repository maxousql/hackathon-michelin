import { Platform } from 'react-native';

const emulatorApiUrl =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3001/api/v1'
    : 'http://localhost:3001/api/v1';

export const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL ?? emulatorApiUrl;
