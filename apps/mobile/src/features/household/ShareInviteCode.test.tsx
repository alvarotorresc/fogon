import { Share } from 'react-native';
import { renderHook, act } from '@testing-library/react-native';
import { useShareInvite } from './useShareInvite';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      const translations: Record<string, string> = {
        'hogar.share_invite': `Join my household on Fogon! Use the code: ${params?.code ?? ''}`,
      };
      return translations[key] ?? key;
    },
  }),
}));

jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });

describe('useShareInvite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call Share.share with localized message when shareInvite is called', async () => {
    const { result } = renderHook(() => useShareInvite('ABC123'));

    await act(async () => {
      await result.current.shareInvite();
    });

    expect(Share.share).toHaveBeenCalledWith({
      message: 'Join my household on Fogon! Use the code: ABC123',
    });
  });

  it('should call Share.share with raw code when copyCode is called', async () => {
    const { result } = renderHook(() => useShareInvite('XYZ789'));

    await act(async () => {
      await result.current.copyCode();
    });

    expect(Share.share).toHaveBeenCalledWith({
      message: 'XYZ789',
    });
  });

  it('should not call Share.share when inviteCode is undefined', async () => {
    const { result } = renderHook(() => useShareInvite(undefined));

    await act(async () => {
      await result.current.shareInvite();
    });

    expect(Share.share).not.toHaveBeenCalled();
  });

  it('should not crash when Share.share throws', async () => {
    (Share.share as jest.Mock).mockRejectedValueOnce(new Error('User cancelled'));

    const { result } = renderHook(() => useShareInvite('ABC123'));

    await act(async () => {
      await result.current.shareInvite();
    });

    expect(Share.share).toHaveBeenCalledTimes(1);
  });
});
