import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { createElement } from 'react';
import { ErrorToast } from './ErrorToast';
import { useErrorStore } from '@/store/errorStore';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.retry': 'Retry',
        'common.close': 'Close',
      };
      return translations[key] ?? key;
    },
  }),
}));

jest.mock('@/constants/useColors', () => ({
  useColors: () => ({
    error: '#DC2626',
    textPrimary: '#EDEDED',
  }),
}));

beforeEach(() => {
  jest.useFakeTimers();
  useErrorStore.setState({ toast: null });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('ErrorToast', () => {
  it('should not render when there is no toast', () => {
    render(createElement(ErrorToast));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('should render the error message', () => {
    useErrorStore.getState().showError('Something failed');
    render(createElement(ErrorToast));
    expect(screen.getByText('Something failed')).toBeTruthy();
  });

  it('should show retry button when retryAction is provided', () => {
    const retryFn = jest.fn();
    useErrorStore.getState().showError('Network error', retryFn);
    render(createElement(ErrorToast));
    expect(screen.getByText('Retry')).toBeTruthy();
  });

  it('should not show retry button when no retryAction', () => {
    useErrorStore.getState().showError('Generic error');
    render(createElement(ErrorToast));
    expect(screen.queryByText('Retry')).toBeNull();
  });

  it('should call retryAction and dismiss when retry is pressed', () => {
    const retryFn = jest.fn();
    useErrorStore.getState().showError('Error', retryFn);
    render(createElement(ErrorToast));
    fireEvent.press(screen.getByLabelText('Retry'));
    expect(retryFn).toHaveBeenCalledTimes(1);
    expect(useErrorStore.getState().toast).toBeNull();
  });

  it('should dismiss when close button is pressed', () => {
    useErrorStore.getState().showError('Error');
    render(createElement(ErrorToast));
    fireEvent.press(screen.getByLabelText('Close'));
    expect(useErrorStore.getState().toast).toBeNull();
  });

  it('should auto-dismiss after 4 seconds', () => {
    useErrorStore.getState().showError('Temporary error');
    render(createElement(ErrorToast));
    expect(useErrorStore.getState().toast).not.toBeNull();

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(useErrorStore.getState().toast).toBeNull();
  });

  it('should have accessible role alert', () => {
    useErrorStore.getState().showError('Accessible error');
    const { UNSAFE_root } = render(createElement(ErrorToast));
    const alertNode = UNSAFE_root.findAll(
      (node) => node.props.accessibilityRole === 'alert',
    );
    expect(alertNode.length).toBeGreaterThan(0);
  });
});
