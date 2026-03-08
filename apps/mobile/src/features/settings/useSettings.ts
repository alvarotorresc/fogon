import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

type Language = 'en' | 'es';

export function useSettings() {
  const { i18n } = useTranslation();
  const { user } = useAuthStore();

  const currentLanguage = (i18n.language === 'es' ? 'es' : 'en') as Language;

  const changeLanguage = useCallback(
    (language: Language) => {
      i18n.changeLanguage(language);
    },
    [i18n],
  );

  const userEmail = user?.email ?? '';
  const userDisplayName = user?.user_metadata?.display_name as string | undefined;

  return {
    currentLanguage,
    changeLanguage,
    userEmail,
    userDisplayName: userDisplayName ?? '',
  };
}

export function useUpdateDisplayName() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const updateDisplayName = useCallback(async (name: string) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { display_name: name },
      });
      if (updateError) {
        setError(updateError.message);
        return false;
      }
      setIsSuccess(true);
      return true;
    } catch {
      setError('Failed to update name');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateDisplayName, isLoading, error, isSuccess };
}
