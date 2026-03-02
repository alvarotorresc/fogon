/**
 * Design Tokens — Fogon
 * Basados en visual-brief.md + IDENTITY.md
 * Dark mode por defecto (OLED-first mobile app)
 */

export const colors = {
  // Primario: brand-blue (acciones, CTAs)
  primary: '#3291FF',

  // Temático Fogon: terracota cálido
  terracota: '#EA580C',        // Dark mode variant
  terracotaDeep: '#C2410C',    // Brand color oficial
  terracotaFaint: '#1A0C07',   // Fondo con tinte terracota

  // Fondos (dark mode, OLED-first)
  bgPrimary: '#0A0A0A',
  bgSecondary: '#111111',
  bgTertiary: '#1A1A1A',
  bgElevated: '#222222',

  // Bordes
  border: '#2E2E2E',
  borderSubtle: '#1E1E1E',

  // Texto
  textPrimary: '#EDEDED',
  textSecondary: '#A3A3A3',
  textTertiary: '#525252',

  // Semánticos
  success: '#22C55E',
  successBg: '#031a0d',
  successBorder: '#14532d',
  warning: '#F59E0B',
  warningBg: '#1c1007',
  error: '#EF4444',

  // Avatares de usuarios del hogar
  ana: '#8B5CF6',    // Violeta
  pablo: '#0EA5E9',  // Azul cielo
};

export const typography = {
  family: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
  scale: {
    '2xs': { size: 10, lineHeight: 14, weight: 400 },
    xs:    { size: 12, lineHeight: 16, weight: 400 },
    sm:    { size: 13, lineHeight: 18, weight: 400 },
    base:  { size: 15, lineHeight: 22, weight: 400 },
    lg:    { size: 17, lineHeight: 24, weight: 600 },
    xl:    { size: 20, lineHeight: 28, weight: 700 },
    '2xl': { size: 24, lineHeight: 32, weight: 700 },
    '3xl': { size: 28, lineHeight: 36, weight: 700 },
  },
};

export const spacing = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48,
};

export const radius = {
  sm: 6, md: 8, lg: 12, xl: 16, full: 9999,
};

// Dimensiones de sistema (iPhone 14 / 390x844)
export const system = {
  statusBarHeight: 59,  // Incluye Dynamic Island
  tabBarHeight: 83,     // Tab bar + home indicator
  screenWidth: 390,
  screenHeight: 844,
};

// Utilidades de estilo reutilizables
export const base = {
  font: typography.family,
  bg: colors.bgPrimary,
  text: colors.textPrimary,
};
