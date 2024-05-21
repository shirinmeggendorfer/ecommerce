module.exports = {
  verbose: true,
  detectOpenHandles: true,
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/'
  ],
  coverageDirectory: 'coverage',
  collectCoverage: true,
  collectCoverageFrom: [
    '**/index.js', 
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
};

