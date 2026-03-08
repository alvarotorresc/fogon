import { render, screen, fireEvent } from '@testing-library/react-native';
import SettingsScreen from '../../../app/settings';

const mockBack = jest.fn();
const mockChangeLanguage = jest.fn();

jest.mock('expo-router', () => ({
  router: { back: (...args: unknown[]) => mockBack(...args), push: jest.fn() },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'settings.title': 'Settings',
        'settings.profile': 'Profile',
        'settings.email': 'Email',
        'settings.display_name': 'Display name',
        'settings.display_name_placeholder': 'Your name',
        'settings.save_name': 'Save',
        'settings.appearance': 'Appearance',
        'settings.appearance_coming_soon': 'Coming soon',
        'settings.language': 'Language',
        'settings.language_en': 'English',
        'settings.language_es': 'Español',
        'settings.notifications': 'Notifications',
        'settings.push_notifications': 'Push notifications',
        'settings.notifications_coming_soon': 'Coming soon',
        'settings.about': 'About',
        'settings.version': 'Version',
        'settings.made_with': 'Made with fire by Alvaro Torres',
        'settings.license': 'MIT License',
        'common.close': 'Close',
      };
      return translations[key] ?? key;
    },
    i18n: {
      language: 'es',
      changeLanguage: mockChangeLanguage,
    },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: {
      email: 'user@test.com',
      user_metadata: { display_name: 'Test User' },
    },
  }),
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: { version: '0.1.0' },
  },
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      updateUser: jest.fn().mockResolvedValue({ error: null }),
    },
  },
}));

describe('SettingsScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders all section headers', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getAllByText('Profile').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Appearance').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Language').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Notifications').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('About').length).toBeGreaterThanOrEqual(1);
  });

  it('displays user email', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('user@test.com')).toBeTruthy();
  });

  it('displays app version', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('0.1.0')).toBeTruthy();
  });

  it('renders language options', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('English')).toBeTruthy();
    expect(screen.getAllByText('Español').length).toBeGreaterThanOrEqual(1);
  });

  it('navigates back when back button is pressed', () => {
    render(<SettingsScreen />);
    const backButton = screen.getByLabelText('Close');
    fireEvent.press(backButton);
    expect(mockBack).toHaveBeenCalled();
  });

  it('switches language when option is pressed', () => {
    render(<SettingsScreen />);
    fireEvent.press(screen.getByText('English'));
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });

  it('displays attribution link', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('Made with fire by Alvaro Torres')).toBeTruthy();
  });

  it('displays MIT License', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('MIT License')).toBeTruthy();
  });
});
