import { act, renderHook, waitFor } from '@testing-library/react-native';

jest.mock('../../context/auth-context', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '../../context/auth-context';
import { useLoginForm } from '../use-login-form';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

function makeAuthContext(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  return {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    token: null,
    user: null,
    isLoading: false,
    ...overrides,
  };
}

describe('useLoginForm', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue(makeAuthContext());
  });

  it('initialises fields to empty strings', async () => {
    const { result } = await renderHook(() => useLoginForm());
    await waitFor(() => expect(result.current).not.toBeNull());
    expect(result.current.fields).toEqual({ email: '', password: '' });
  });

  it('updates email via update()', async () => {
    const { result } = await renderHook(() => useLoginForm());
    await waitFor(() => expect(result.current).not.toBeNull());
    await act(async () => result.current.update('email')('test@example.com'));
    expect(result.current.fields.email).toBe('test@example.com');
  });

  it('updates password via update()', async () => {
    const { result } = await renderHook(() => useLoginForm());
    await waitFor(() => expect(result.current).not.toBeNull());
    await act(async () => result.current.update('password')('Secret1!'));
    expect(result.current.fields.password).toBe('Secret1!');
  });

  it('does not call login when fields are empty', async () => {
    const login = jest.fn();
    mockUseAuth.mockReturnValue(makeAuthContext({ login }));
    const { result } = await renderHook(() => useLoginForm());
    await waitFor(() => expect(result.current).not.toBeNull());
    await act(async () => result.current.submit());
    expect(login).not.toHaveBeenCalled();
  });

  it('calls login with the current fields when both are filled', async () => {
    const login = jest.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue(makeAuthContext({ login }));
    const { result } = await renderHook(() => useLoginForm());
    await waitFor(() => expect(result.current).not.toBeNull());

    await act(async () => result.current.update('email')('test@example.com'));
    await act(async () => result.current.update('password')('Secret1!'));
    await act(async () => result.current.submit());

    expect(login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Secret1!',
    });
  });

  it('sets error when login rejects', async () => {
    const login = jest
      .fn()
      .mockRejectedValue(new Error('Identifiants invalides'));
    mockUseAuth.mockReturnValue(makeAuthContext({ login }));
    const { result } = await renderHook(() => useLoginForm());
    await waitFor(() => expect(result.current).not.toBeNull());

    await act(async () => result.current.update('email')('test@example.com'));
    await act(async () => result.current.update('password')('wrong'));
    await act(async () => result.current.submit());

    expect(result.current.error).toBe('Identifiants invalides');
  });

  it('clears error on subsequent successful submit', async () => {
    const login = jest
      .fn()
      .mockRejectedValueOnce(new Error('Oops'))
      .mockResolvedValueOnce(undefined);
    mockUseAuth.mockReturnValue(makeAuthContext({ login }));
    const { result } = await renderHook(() => useLoginForm());
    await waitFor(() => expect(result.current).not.toBeNull());

    await act(async () => result.current.update('email')('test@example.com'));
    await act(async () => result.current.update('password')('Secret1!'));

    await act(async () => result.current.submit());
    expect(result.current.error).toBe('Oops');

    await act(async () => result.current.submit());
    expect(result.current.error).toBeNull();
  });

  it('resets pending to false after submit completes', async () => {
    const login = jest.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue(makeAuthContext({ login }));
    const { result } = await renderHook(() => useLoginForm());
    await waitFor(() => expect(result.current).not.toBeNull());

    await act(async () => result.current.update('email')('test@example.com'));
    await act(async () => result.current.update('password')('Secret1!'));
    await act(async () => result.current.submit());

    expect(result.current.pending).toBe(false);
  });
});
