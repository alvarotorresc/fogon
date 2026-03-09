import { renderHook, act } from '@testing-library/react-native';
import { useLogin, useRegister } from './useAuth';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
    },
  },
}));

describe('useLogin', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls signInWithPassword with correct args', async () => {
    const { supabase } = require('@/lib/supabase');
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({ error: null });

    const { result } = renderHook(() => useLogin());
    await act(async () => {
      const ok = await result.current.login('test@test.com', 'pass123');
      expect(ok).toBe(true);
    });
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'pass123',
    });
  });

  it('sets error when login fails', async () => {
    const { supabase } = require('@/lib/supabase');
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      error: { message: 'Invalid credentials' },
    });

    const { result } = renderHook(() => useLogin());
    await act(async () => {
      await result.current.login('bad@test.com', 'wrong');
    });
    expect(result.current.error).toBe('Invalid credentials');
  });
});

describe('useRegister', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls signUp with correct args', async () => {
    const { supabase } = require('@/lib/supabase');
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({ error: null });

    const { result } = renderHook(() => useRegister());
    await act(async () => {
      const ok = await result.current.register('test@test.com', 'pass123', 'John');
      expect(ok).toBe(true);
    });
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'pass123',
      options: { data: { display_name: 'John' } },
    });
  });

  it('sets error when register fails', async () => {
    const { supabase } = require('@/lib/supabase');
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      error: { message: 'Email taken' },
    });

    const { result } = renderHook(() => useRegister());
    await act(async () => {
      await result.current.register('taken@test.com', 'pass', 'Bob');
    });
    expect(result.current.error).toBe('Email taken');
  });
});
