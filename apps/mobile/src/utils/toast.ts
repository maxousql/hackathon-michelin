import Toast from 'react-native-toast-message';

export const toast = {
  success: (message: string, title?: string) =>
    Toast.show({
      type: 'success',
      text1: title ?? 'Succès',
      text2: message,
      visibilityTime: 3000,
    }),

  error: (message: string, title?: string) =>
    Toast.show({
      type: 'error',
      text1: title ?? 'Erreur',
      text2: message,
      visibilityTime: 4000,
    }),

  info: (message: string, title?: string) =>
    Toast.show({
      type: 'info',
      text1: title ?? 'Info',
      text2: message,
      visibilityTime: 3000,
    }),
};
