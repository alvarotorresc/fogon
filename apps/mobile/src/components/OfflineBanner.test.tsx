import { render, screen } from '@testing-library/react-native';
import { OfflineBanner } from './OfflineBanner';

let mockIsConnected = true;

jest.mock('@/lib/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isConnected: mockIsConnected }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'offline.banner': 'Offline — showing cached data',
      };
      return translations[key] ?? key;
    },
  }),
}));

jest.mock('lucide-react-native', () => ({
  WifiOff: () => 'WifiOff',
}));

describe('OfflineBanner', () => {
  beforeEach(() => {
    mockIsConnected = true;
  });

  it('should not render when connected', () => {
    mockIsConnected = true;
    render(<OfflineBanner />);
    expect(screen.queryByText('Offline — showing cached data')).toBeNull();
  });

  it('should render banner when offline', () => {
    mockIsConnected = false;
    render(<OfflineBanner />);
    expect(screen.getByText('Offline — showing cached data')).toBeTruthy();
  });

  it('should have alert accessibility role when offline', () => {
    mockIsConnected = false;
    render(<OfflineBanner />);
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});
