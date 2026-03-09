import { useEffect } from 'react';
import { useColorScheme } from 'nativewind';
import { useThemeStore } from './themeStore';

/**
 * Syncs the Zustand theme store with NativeWind's color scheme.
 * Call this once in the root layout.
 *
 * - 'system' -> delegates to device preference (NativeWind default)
 * - 'light' / 'dark' -> forces that color scheme via NativeWind
 */
export function useThemeSync(): void {
  const mode = useThemeStore((state) => state.mode);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(mode);
  }, [mode, setColorScheme]);
}
