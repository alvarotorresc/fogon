import { act } from '@testing-library/react-native';
import { useThemeStore } from './themeStore';

// Reset store state between tests
beforeEach(() => {
  act(() => {
    useThemeStore.setState({ mode: 'system' });
  });
});

describe('themeStore', () => {
  it('defaults to system mode', () => {
    const { mode } = useThemeStore.getState();
    expect(mode).toBe('system');
  });

  it('sets mode to light', () => {
    act(() => {
      useThemeStore.getState().setMode('light');
    });
    expect(useThemeStore.getState().mode).toBe('light');
  });

  it('sets mode to dark', () => {
    act(() => {
      useThemeStore.getState().setMode('dark');
    });
    expect(useThemeStore.getState().mode).toBe('dark');
  });

  it('sets mode back to system', () => {
    act(() => {
      useThemeStore.getState().setMode('dark');
    });
    act(() => {
      useThemeStore.getState().setMode('system');
    });
    expect(useThemeStore.getState().mode).toBe('system');
  });

});
