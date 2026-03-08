import { useColorScheme } from 'nativewind';
import { getColors } from './colors';

/**
 * Returns theme-aware colors for use in inline styles (icons, etc).
 * For NativeWind className usage, the CSS variables handle theme automatically.
 */
export function useColors() {
  const { colorScheme } = useColorScheme();
  return getColors(colorScheme === 'dark' ? 'dark' : 'light');
}
