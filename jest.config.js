const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './',
});

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
    testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
    collectCoverageFrom: [
        'lib/**/*.{js,ts}',
        'app/api/**/*.{js,ts}',
        '!**/*.d.ts',
    ],
};

module.exports = createJestConfig(customJestConfig);
