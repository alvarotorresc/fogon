interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  bgElevated: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  terracota: string;
  terracotaDeep: string;
  terracotaFaint: string;
  brandBlue: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
}

const LIGHT_COLORS: ThemeColors = {
  bgPrimary: '#FFFFFF',
  bgSecondary: '#FAFAFA',
  bgTertiary: '#F5F5F5',
  bgElevated: '#F0F0F0',
  border: '#E5E5E5',
  borderSubtle: '#F0F0F0',
  textPrimary: '#171717',
  textSecondary: '#525252',
  textTertiary: '#A3A3A3',
  terracota: '#EA580C',
  terracotaDeep: '#C2410C',
  terracotaFaint: '#FFF3ED',
  brandBlue: '#3291FF',
  success: '#16A34A',
  successBg: '#F0FDF4',
  warning: '#D97706',
  warningBg: '#FFFBEB',
  error: '#DC2626',
};

const DARK_COLORS: ThemeColors = {
  bgPrimary: '#0A0A0A',
  bgSecondary: '#111111',
  bgTertiary: '#1A1A1A',
  bgElevated: '#222222',
  border: '#2E2E2E',
  borderSubtle: '#1E1E1E',
  textPrimary: '#EDEDED',
  textSecondary: '#A3A3A3',
  textTertiary: '#525252',
  terracota: '#EA580C',
  terracotaDeep: '#C2410C',
  terracotaFaint: '#1A0C07',
  brandBlue: '#3291FF',
  success: '#22C55E',
  successBg: '#031a0d',
  warning: '#F59E0B',
  warningBg: '#1c1007',
  error: '#EF4444',
};

export function getColors(colorScheme: 'light' | 'dark'): ThemeColors {
  return colorScheme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}

/**
 * @deprecated Use getColors(colorScheme) with useColorScheme() instead.
 * Kept for backward compatibility during migration.
 */
export const COLORS = DARK_COLORS;

export const AVATAR_COLORS = [
  '#8B5CF6',
  '#0EA5E9',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#6366F1',
  '#14B8A6',
];
