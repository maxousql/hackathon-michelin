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
const client = createApiClient({ baseUrl: apiBaseUrl });

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY)
      .then(async (token) => {
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

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setState({ token: null, user: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
