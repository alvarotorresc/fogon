import { useCallback } from 'react';
import { Share } from 'react-native';
import { useTranslation } from 'react-i18next';

export function useShareInvite(inviteCode: string | undefined) {
  const { t } = useTranslation();

  const shareInvite = useCallback(async () => {
    if (!inviteCode) return;
    const message = t('hogar.share_invite', { code: inviteCode });
    try {
      await Share.share({ message });
    } catch {
      // User cancelled
    }
  }, [inviteCode, t]);

  const copyCode = useCallback(async () => {
    if (!inviteCode) return;
    try {
      await Share.share({ message: inviteCode });
    } catch {
      // User cancelled
    }
  }, [inviteCode]);

  return { shareInvite, copyCode };
}
