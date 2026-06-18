import { act, renderHook, waitFor } from '@testing-library/react-native';

jest.mock('../../context/auth-context', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '../../context/auth-context';
import { useRegisterForm } from '../use-register-form';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

function makeAuthContext(overrides: Partial<ReturnType<typeof useAuth>> = {}) {
  return {
    login: jest.fn(),
    register: jest.fn(),
    loginWithStrava: jest.fn(),
    updateStravaPhoto: jest.fn(),
    logout: jest.fn(),
    token: null,
    stravaToken: null,
    stravaPhotoUrl: null,
    user: null,
    isLoading: false,
    ...overrides,
  };
}

describe('useRegisterForm', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue(makeAuthContext());
  });

  it('initialises all fields to empty strings', async () => {
    const { result } = await renderHook(() => useRegisterForm());
    await waitFor(() => expect(result.current).not.toBeNull());
    expect(result.current.fields).toEqual({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirm: '',
    });
  });

  it('updates a field via update()', async () => {
    const { result } = await renderHook(() => useRegisterForm());
    await waitFor(() => expect(result.current).not.toBeNull());
    await act(async () => result.current.update('firstName')('Alice'));
    expect(result.current.fields.firstName).toBe('Alice');
  });

  describe('password rules', () => {
    it('reports all rules as invalid for an empty password', async () => {
      const { result } = await renderHook(() => useRegisterForm());
      await waitFor(() => expect(result.current).not.toBeNull());
      expect(result.current.passwordRules.every((r) => !r.valid)).toBe(true);
    });

    it('marks the length rule valid for a password >= 8 chars', async () => {
      const { result } = await renderHook(() => useRegisterForm());
      await waitFor(() => expect(result.current).not.toBeNull());
      await act(async () => result.current.update('password')('abcdefgh'));
      const lengthRule = result.current.passwordRules.find((r) =>
        r.label.includes('8'),
      );
      expect(lengthRule?.valid).toBe(true);
    });

    it('marks the uppercase rule valid when an uppercase letter is present', async () => {
      const { result } = await renderHook(() => useRegisterForm());
      await waitFor(() => expect(result.current).not.toBeNull());
      await act(async () => result.current.update('password')('Abc'));
      const upperRule = result.current.passwordRules.find((r) =>
        r.label.includes('majuscule'),
      );
      expect(upperRule?.valid).toBe(true);
    });

    it('marks the special-char rule valid for a password with a special char', async () => {
      const { result } = await renderHook(() => useRegisterForm());
      await waitFor(() => expect(result.current).not.toBeNull());
      await act(async () => result.current.update('password')('abc!'));
      const specialRule = result.current.passwordRules.find((r) =>
        r.label.includes('spécial'),
      );
      expect(specialRule?.valid).toBe(true);
    });

    it('marks all rules valid for a strong password', async () => {
      const { result } = await renderHook(() => useRegisterForm());
      await waitFor(() => expect(result.current).not.toBeNull());
      await act(async () => result.current.update('password')('StrongP@ss'));
      expect(result.current.passwordRules.every((r) => r.valid)).toBe(true);
    });
  });

  describe('bothFilled and passwordsMatch', () => {
    it('bothFilled is false when only one confirm field has a value', async () => {
      const { result } = await renderHook(() => useRegisterForm());
      await waitFor(() => expect(result.current).not.toBeNull());
      await act(async () => result.current.update('confirm')('abc'));
      expect(result.current.bothFilled).toBe(false);
    });

    it('bothFilled is true when both password and confirm are non-empty', async () => {
      const { result } = await renderHook(() => useRegisterForm());
      await waitFor(() => expect(result.current).not.toBeNull());
      await act(async () => result.current.update('password')('abc'));
      await act(async () => result.current.update('confirm')('abc'));
      expect(result.current.bothFilled).toBe(true);
    });

    it('passwordsMatch is false when passwords differ', async () => {
      const { result } = await renderHook(() => useRegisterForm());
      await waitFor(() => expect(result.current).not.toBeNull());
      await act(async () => result.current.update('password')('Secret1!'));
      await act(async () => result.current.update('confirm')('Secret2!'));
      expect(result.current.passwordsMatch).toBe(false);
    });

    it('passwordsMatch is true when passwords are identical', async () => {
      const { result } = await renderHook(() => useRegisterForm());
      await waitFor(() => expect(result.current).not.toBeNull());
      await act(async () => result.current.update('password')('Secret1!'));
      await act(async () => result.current.update('confirm')('Secret1!'));
      expect(result.current.passwordsMatch).toBe(true);
    });
  });

  describe('isDisabled', () => {
    it('is false when both fields are empty (not yet filled)', async () => {
      const { result } = await renderHook(() => useRegisterForm());
      await waitFor(() => expect(result.current).not.toBeNull());
      expect(result.current.isDisabled).toBe(false);
    });

    it('is true when both confirm fields are filled but passwords do not match', async () => {
      const { result } = await renderHook(() => useRegisterForm());
      await waitFor(() => expect(result.current).not.toBeNull());
      await act(async () => result.current.update('password')('Secret1!'));
      await act(async () => result.current.update('confirm')('Different!'));
      expect(result.current.isDisabled).toBe(true);
    });

    it('is false when passwords match', async () => {
      const { result } = await renderHook(() => useRegisterForm());
      await waitFor(() => expect(result.current).not.toBeNull());
      await act(async () => result.current.update('password')('Secret1!'));
      await act(async () => result.current.update('confirm')('Secret1!'));
      expect(result.current.isDisabled).toBe(false);
    });
  });

  describe('submit', () => {
    it('does not call register when isDisabled is true', async () => {
      const register = jest.fn();
      mockUseAuth.mockReturnValue(makeAuthContext({ register }));
      const { result } = await renderHook(() => useRegisterForm());
      await waitFor(() => expect(result.current).not.toBeNull());

      await act(async () => result.current.update('password')('Secret1!'));
      await act(async () => result.current.update('confirm')('Different!'));
      await act(async () => result.current.submit());
      expect(register).not.toHaveBeenCalled();
    });

    it('calls register with the correct payload on valid submit', async () => {
      const register = jest.fn().mockResolvedValue(undefined);
      mockUseAuth.mockReturnValue(makeAuthContext({ register }));
      const { result } = await renderHook(() => useRegisterForm());
      await waitFor(() => expect(result.current).not.toBeNull());

      await act(async () => result.current.update('firstName')('Alice'));
      await act(async () => result.current.update('lastName')('Martin'));
      await act(async () =>
        result.current.update('email')('alice@example.com'),
      );
      await act(async () => result.current.update('password')('Secret1!'));
      await act(async () => result.current.update('confirm')('Secret1!'));
      await act(async () => result.current.submit());

      expect(register).toHaveBeenCalledWith({
        firstName: 'Alice',
        lastName: 'Martin',
        email: 'alice@example.com',
        password: 'Secret1!',
      });
    });

    it('sets error when register rejects', async () => {
      const register = jest
        .fn()
        .mockRejectedValue(new Error('Email déjà utilisé'));
      mockUseAuth.mockReturnValue(makeAuthContext({ register }));
      const { result } = await renderHook(() => useRegisterForm());
      await waitFor(() => expect(result.current).not.toBeNull());

      await act(async () => result.current.update('firstName')('Alice'));
      await act(async () => result.current.update('lastName')('Martin'));
      await act(async () =>
        result.current.update('email')('alice@example.com'),
      );
      await act(async () => result.current.update('password')('Secret1!'));
      await act(async () => result.current.update('confirm')('Secret1!'));
      await act(async () => result.current.submit());
      expect(result.current.error).toBe('Email déjà utilisé');
    });
  });
});
