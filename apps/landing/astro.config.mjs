import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://fogon.app',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
