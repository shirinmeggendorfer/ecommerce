module.exports = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  testEnvironment: "jsdom",
  maxWorkers: 2,
  setupFilesAfterEnv: ["<rootDir>/src/jest.setup.js"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(png|jpg|jpeg|gif|webp|svg)$": "<rootDir>/src/__mocks__/fileMock.js"
  },
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest"
  }
};

