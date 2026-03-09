module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    '^expo-server-sdk$': '<rootDir>/../test/__mocks__/expo-server-sdk.ts',
  },
  collectCoverageFrom: ['**/*.ts', '!main.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
