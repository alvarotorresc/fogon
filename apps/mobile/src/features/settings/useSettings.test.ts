import { renderHook, act } from '@testing-library/react-native';
import { useSettings, useUpdateDisplayName } from './useSettings';

const mockChangeLanguage = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'es',
      changeLanguage: mockChangeLanguage,
    },
    t: (key: string) => key,
  }),
}));

jest.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: {
      email: 'test@example.com',
      user_metadata: { display_name: 'Test User' },
    },
  }),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      updateUser: jest.fn(),
    },
  },
}));

describe('useSettings', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns current language from i18n', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.currentLanguage).toBe('es');
  });

  it('returns user email and display name', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.userEmail).toBe('test@example.com');
    expect(result.current.userDisplayName).toBe('Test User');
  });

  it('calls i18n.changeLanguage when switching language', () => {
    const { result } = renderHook(() => useSettings());
    act(() => {
      result.current.changeLanguage('en');
    });
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });
});

describe('useUpdateDisplayName', () => {
  beforeEach(() => jest.clearAllMocks());

  it('updates display name successfully', async () => {
    const { supabase } = require('@/lib/supabase');
    (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: null });

    const { result } = renderHook(() => useUpdateDisplayName());
    let ok: boolean;
    await act(async () => {
      ok = await result.current.updateDisplayName('New Name');
    });
    expect(ok!).toBe(true);
    expect(result.current.isSuccess).toBe(true);
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      data: { display_name: 'New Name' },
    });
  });

  it('sets error when update fails', async () => {
    const { supabase } = require('@/lib/supabase');
    (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
      error: { message: 'Update failed' },
    });

    const { result } = renderHook(() => useUpdateDisplayName());
    let ok: boolean;
    await act(async () => {
      ok = await result.current.updateDisplayName('Bad Name');
    });
    expect(ok!).toBe(false);
    expect(result.current.error).toBe('Update failed');
    expect(result.current.isSuccess).toBe(false);
  });
});
