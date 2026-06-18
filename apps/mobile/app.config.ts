import type { ConfigContext, ExpoConfig } from 'expo/config';

export default function appConfig({ config }: ConfigContext): ExpoConfig {
  const projectId = process.env.EXPO_PROJECT_ID;

  return {
    ...config,
    name: 'Michelin Hackathon',
    slug: 'hackathon-michelin',
    version: '0.1.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/logo-michelin-race.png',
      resizeMode: 'contain',
      backgroundColor: '#00133B',
    },
    scheme: 'michelin-race',
    ios: {
      bundleIdentifier: 'com.esgi.hackathonmichelin',
      supportsTablet: true,
      infoPlist: {
        UIFileSharingEnabled: true,
        LSSupportsOpeningDocumentsInPlace: true,
      },
    },
    android: {
      package: 'com.esgi.hackathonmichelin',
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [{ scheme: 'michelin-race' }],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    ...(projectId
      ? {
          extra: {
            eas: {
              projectId,
            },
          },
        }
      : {}),
  };
}
