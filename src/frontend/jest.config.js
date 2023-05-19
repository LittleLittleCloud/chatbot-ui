module.exports = {
    rootDir: "./",
    clearMocks: true,
    coverageDirectory: "coverage",
    collectCoverageFrom: ["src/**/*.ts"],
    coveragePathIgnorePatterns: [
      "/node_modules/",
      "types\\.ts",
      "test\\.ts",
    ],
    globals: {
      'ts-jest': {
        tsConfig: '<rootDir>/tsconfig.test.json'
      },
      'window': {},
    },
    testPathIgnorePatterns: ["/node_modules/"],
    testEnvironment: "node",
    setupFilesAfterEnv: ["<rootDir>/test/jest.setup.ts"],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1',
    },
    transform: {
      "^.+\\.tsx?$": ["ts-jest", "<rootDir>/tsconfig.test.json"]
    },
    setupFiles: [
      "fake-indexeddb/auto"
    ]
  };