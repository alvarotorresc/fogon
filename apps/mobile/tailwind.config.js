const { hairlineWidth } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          terracota: '#EA580C',
          'terracota-deep': '#C2410C',
          'terracota-faint': '#1A0C07',
          blue: '#3291FF',
        },
        bg: {
          primary: '#0A0A0A',
          secondary: '#111111',
          tertiary: '#1A1A1A',
          elevated: '#222222',
        },
        border: {
          DEFAULT: '#2E2E2E',
          subtle: '#1E1E1E',
        },
        text: {
          primary: '#EDEDED',
          secondary: '#A3A3A3',
          tertiary: '#525252',
        },
        success: { DEFAULT: '#22C55E', bg: '#031a0d' },
        warning: { DEFAULT: '#F59E0B', bg: '#1c1007' },
        error: '#EF4444',
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
  plugins: [],
};
