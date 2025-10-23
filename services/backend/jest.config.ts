// jest.config.ts
import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};

export default config;
