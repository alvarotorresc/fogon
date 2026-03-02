module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(?:.pnpm/)?(?:react-native|@react-native|expo|@expo|nativewind|react-navigation|@react-navigation|lucide-react-native|zustand|i18next|react-i18next|@supabase|@tanstack|socket\\.io))',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
