module.exports = {
  preset: 'ts-jest',

  // Multiple test environments for different contexts
  projects: [
    {
      displayName: 'ui-components',
      testMatch: ['<rootDir>/tests/unit/components/**/*.test.*'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/tests/setup/ui.setup.js'],
      moduleNameMapping: {
        '^@ui/(.*)$': '<rootDir>/src/ui/$1',
        '^@shared/(.*)$': '<rootDir>/src/shared/$1',
        '\\.css$': 'identity-obj-proxy',
      },
      transformIgnorePatterns: [
        'node_modules/(?!(@testing-library|@babel|babel-preset-react-app)/)'
      ],
    },
    {
      displayName: 'main-thread',
      testMatch: ['<rootDir>/tests/unit/main/**/*.test.*'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/setup/main.setup.js'],
      moduleNameMapping: {
        '^@main/(.*)$': '<rootDir>/src/main/$1',
        '^@shared/(.*)$': '<rootDir>/src/shared/$1',
      },
    },
    {
      displayName: 'shared-utilities',
      testMatch: ['<rootDir>/tests/unit/shared/**/*.test.*'],
      testEnvironment: 'node',
      moduleNameMapping: {
        '^@shared/(.*)$': '<rootDir>/src/shared/$1',
      },
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.*'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/tests/setup/ui.setup.js'],
      moduleNameMapping: {
        '^@ui/(.*)$': '<rootDir>/src/ui/$1',
        '^@main/(.*)$': '<rootDir>/src/main/$1',
        '^@shared/(.*)$': '<rootDir>/src/shared/$1',
        '\\.css$': 'identity-obj-proxy',
      },
      transformIgnorePatterns: [
        'node_modules/(?!(@testing-library|@babel|babel-preset-react-app)/)'
      ],
    }
  ],

  // Global coverage settings
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.*',
    '!src/**/index.ts', // Usually just exports
  ],

  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    // Specific thresholds for critical components
    'src/ui/components/base/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    'src/shared/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    }
  },

  // Coverage reporting
  coverageReporters: ['text', 'lcov', 'html'],

  // Test timeouts
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
};
