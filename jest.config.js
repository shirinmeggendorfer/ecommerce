module.exports = {
    roots: ['<rootDir>/e-commerce-admin2', '<rootDir>/e-commerce-frontend', '<rootDir>/e-commerce-backend'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['html', 'text', 'lcov'],
    testMatch: [
      '**/__tests__/**/*.js?(x)',
      '**/?(*.)+(spec|test).js?(x)'
    ],
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
    coverageThreshold: {
      global: {
        branches: 75,
        functions: 75,
        lines: 75,
        statements: 75
      }
    }
  };
  