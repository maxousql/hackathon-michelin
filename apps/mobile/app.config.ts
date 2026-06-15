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
    ios: {
      bundleIdentifier: 'com.esgi.hackathonmichelin',
      supportsTablet: true,
    },
    android: {
      package: 'com.esgi.hackathonmichelin',
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
