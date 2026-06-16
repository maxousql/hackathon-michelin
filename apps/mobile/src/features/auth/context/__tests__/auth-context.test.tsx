import { act, renderHook, waitFor } from '@testing-library/react-native';

const mockGetItemAsync = jest.fn();
const mockSetItemAsync = jest.fn();
const mockDeleteItemAsync = jest.fn();

jest.mock('expo-secure-store', () => ({
  getItemAsync: (...args: unknown[]) => mockGetItemAsync(...args),
  setItemAsync: (...args: unknown[]) => mockSetItemAsync(...args),
  deleteItemAsync: (...args: unknown[]) => mockDeleteItemAsync(...args),
}));

const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockGetMe = jest.fn();

jest.mock('@michelin/api-client', () => ({
  createApiClient: () => ({
    login: (...args: unknown[]) => mockLogin(...args),
    register: (...args: unknown[]) => mockRegister(...args),
    getMe: (...args: unknown[]) => mockGetMe(...args),
  }),
}));

jest.mock('../../../../config/api', () => ({
  apiBaseUrl: 'http://localhost:3001',
}));

import { AuthProvider, useAuth } from '../auth-context';

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

const AUTH_RESPONSE = {
  accessToken: 'tok_123',
  user: {
    id: 'u1',
    firstName: 'Alice',
    lastName: 'Martin',
    email: 'alice@example.com',
  },
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItemAsync.mockResolvedValue(null);
  });

  it('resolves to unauthenticated when no stored token', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('restores the session when a valid token is stored', async () => {
    mockGetItemAsync.mockResolvedValue('stored_token');
    mockGetMe.mockResolvedValue(AUTH_RESPONSE.user);

    const { result } = await renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.token).toBe('stored_token');
    expect(result.current.user).toEqual(AUTH_RESPONSE.user);
  });

  it('clears the token if getMe throws during restore', async () => {
    mockGetItemAsync.mockResolvedValue('invalid_token');
    mockGetMe.mockRejectedValue(new Error('401'));

    const { result } = await renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.token).toBeNull();
    expect(mockDeleteItemAsync).toHaveBeenCalledWith('auth_token');
  });

  describe('login()', () => {
    it('calls the api client and stores the token', async () => {
      mockLogin.mockResolvedValue(AUTH_RESPONSE);

      const { result } = await renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.login({
          email: 'alice@example.com',
          password: 'Secret1!',
        });
      });

      expect(mockLogin).toHaveBeenCalledWith({
        email: 'alice@example.com',
        password: 'Secret1!',
      });
      expect(mockSetItemAsync).toHaveBeenCalledWith('auth_token', 'tok_123');
      expect(result.current.token).toBe('tok_123');
      expect(result.current.user).toEqual(AUTH_RESPONSE.user);
    });

    it('propagates errors from the api client', async () => {
      mockLogin.mockRejectedValue(new Error('Unauthorized'));

      const { result } = await renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.login({
            email: 'bad@example.com',
            password: 'wrong',
          });
        }),
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('register()', () => {
    it('calls the api client and stores the token', async () => {
      mockRegister.mockResolvedValue(AUTH_RESPONSE);

      const { result } = await renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.register({
          firstName: 'Alice',
          lastName: 'Martin',
          email: 'alice@example.com',
          password: 'Secret1!',
        });
      });

      expect(mockSetItemAsync).toHaveBeenCalledWith('auth_token', 'tok_123');
      expect(result.current.user).toEqual(AUTH_RESPONSE.user);
    });
  });

  describe('logout()', () => {
    it('deletes the stored token and clears state', async () => {
      mockGetItemAsync.mockResolvedValue('stored_token');
      mockGetMe.mockResolvedValue(AUTH_RESPONSE.user);

      const { result } = await renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.token).toBe('stored_token');

      await act(async () => result.current.logout());

      expect(mockDeleteItemAsync).toHaveBeenCalledWith('auth_token');
      expect(result.current.token).toBeNull();
      expect(result.current.user).toBeNull();
    });
  });

  it('throws when useAuth is used outside AuthProvider', async () => {
    const { result } = await renderHook(() => {
      try {
        return useAuth();
      } catch (e) {
        return e;
      }
    });
    expect(result.current).toBeInstanceOf(Error);
  });
});
