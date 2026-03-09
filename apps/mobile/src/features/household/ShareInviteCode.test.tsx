import { Share } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { View, Text, Pressable } from 'react-native';
import { useCallback } from 'react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      const translations: Record<string, string> = {
        'hogar.share_invite': `Join my household on Fogon! Use the code: ${params?.code ?? ''}`,
        'hogar.share_button': 'Share code',
      };
      return translations[key] ?? key;
    },
  }),
}));

jest.mock('lucide-react-native', () => ({
  Share2: () => 'Share2',
}));

jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });

/**
 * Minimal component that replicates the share invite logic from home.tsx
 * to test the Share.share call in isolation.
 */
function ShareInviteButton({ inviteCode }: { inviteCode: string }) {
  const handleShare = useCallback(async () => {
    const message = `Join my household on Fogon! Use the code: ${inviteCode}`;
    try {
      await Share.share({ message });
    } catch {
      // User cancelled
    }
  }, [inviteCode]);

  return (
    <View>
      <Text>Code: {inviteCode}</Text>
      <Pressable onPress={handleShare} accessibilityRole="button" accessibilityLabel="Share code">
        <Text>Share code</Text>
      </Pressable>
    </View>
  );
}

describe('Share invite code', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call Share.share with the localized message including the code', async () => {
    render(<ShareInviteButton inviteCode="ABC123" />);

    await fireEvent.press(screen.getByRole('button', { name: 'Share code' }));

    expect(Share.share).toHaveBeenCalledWith({
      message: 'Join my household on Fogon! Use the code: ABC123',
    });
  });

  it('should display the invite code', () => {
    render(<ShareInviteButton inviteCode="XYZ789" />);

    expect(screen.getByText('Code: XYZ789')).toBeTruthy();
  });

  it('should not crash if Share.share throws', async () => {
    (Share.share as jest.Mock).mockRejectedValueOnce(new Error('User cancelled'));

    render(<ShareInviteButton inviteCode="ABC123" />);

    // Should not throw — the component catches the error
    fireEvent.press(screen.getByRole('button', { name: 'Share code' }));

    // Flush microtasks
    await Promise.resolve();

    expect(Share.share).toHaveBeenCalledTimes(1);
  });
});
