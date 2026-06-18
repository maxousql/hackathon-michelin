import { createApiClient } from '@michelin/api-client';
import type {
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '@michelin/contracts';
import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { apiBaseUrl } from '../../../config/api';

const TOKEN_KEY = 'auth_token';
const STRAVA_TOKEN_KEY = 'strava_token';
const STRAVA_PHOTO_KEY = 'strava_photo_url';
const client = createApiClient({ baseUrl: apiBaseUrl });

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  stravaToken: string | null;
  stravaPhotoUrl: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loginWithStrava: (stravaToken: string) => Promise<void>;
  updateStravaPhoto: (url: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
  });
  const [stravaToken, setStravaToken] = useState<string | null>(null);
  const [stravaPhotoUrl, setStravaPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync(STRAVA_TOKEN_KEY),
      SecureStore.getItemAsync(STRAVA_PHOTO_KEY),
    ])
      .then(async ([token, storedStravaToken, storedPhoto]) => {
        if (storedStravaToken) setStravaToken(storedStravaToken);
        if (storedPhoto) setStravaPhotoUrl(storedPhoto);
        if (!token) {
          setState({ token: null, user: null, isLoading: false });
          return;
        }
        try {
          const user = await client.getMe(token);
          setState({ token, user, isLoading: false });
        } catch {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          setState({ token: null, user: null, isLoading: false });
        }
      })
      .catch(() => {
        setState({ token: null, user: null, isLoading: false });
      });
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const { accessToken, user } = await client.login(data);
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    setState({ token: accessToken, user, isLoading: false });
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const { accessToken, user } = await client.register(data);
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    setState({ token: accessToken, user, isLoading: false });
  }, []);

  const loginWithStrava = useCallback(async (rawStravaToken: string) => {
    const { accessToken, user } = await client.loginWithStrava(rawStravaToken);
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(STRAVA_TOKEN_KEY, rawStravaToken),
    ]);
    setStravaToken(rawStravaToken);
    setState({ token: accessToken, user, isLoading: false });
  }, []);

  const updateStravaPhoto = useCallback(async (url: string) => {
    await SecureStore.setItemAsync(STRAVA_PHOTO_KEY, url);
    setStravaPhotoUrl(url);
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(STRAVA_TOKEN_KEY),
      SecureStore.deleteItemAsync(STRAVA_PHOTO_KEY),
    ]);
    setStravaToken(null);
    setStravaPhotoUrl(null);
    setState({ token: null, user: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        stravaToken,
        stravaPhotoUrl,
        login,
        register,
        loginWithStrava,
        updateStravaPhoto,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
