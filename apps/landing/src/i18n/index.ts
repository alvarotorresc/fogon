import en from './en.json';
import es from './es.json';

export type Locale = 'en' | 'es';

export type Translations = typeof en;

const translations: Record<Locale, Translations> = { en, es };

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === 'en' ? 'es' : 'en';
}

export function getAlternatePath(locale: Locale): string {
  return locale === 'en' ? '/es/' : '/';
}
