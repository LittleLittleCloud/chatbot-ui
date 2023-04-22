module.exports = {
    clearMocks: true,
    coverageDirectory: "coverage",
    coveragePathIgnorePatterns: [
      "/node_modules/",
      "types\\.ts",
      "test\\.ts",
    ],
    globals: {
      'ts-jest': {
        tsConfig: '<rootDir>/test//tsconfig.test.json'
      }
    },
    testPathIgnorePatterns: ["/node_modules/"],
    moduleFileExtensions: ["ts", "tsx", "js"],
    testEnvironment: "node",
  };