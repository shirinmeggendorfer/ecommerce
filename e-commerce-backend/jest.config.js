module.exports = {
  verbose: true,
  testEnvironment: "node",
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
  moduleFileExtensions: ["js", "jsx"],
  setupFiles: ["<rootDir>/setupTests.js"]
};
