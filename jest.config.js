const nextJest = require('next/jest');

const createJestConfig = nextJest({
    dir: './',
});

const customJestConfig = {
    setupFiles: ['<rootDir>/jest.polyfills.js'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^bson$': '<rootDir>/node_modules/bson/lib/bson.cjs',
    },
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
    transformIgnorePatterns: [
        '/node_modules/(?!(mongodb|bson|mongodb-memory-server|mongodb-memory-server-core)/)',
    ],
    testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
    collectCoverageFrom: [
        'lib/**/*.{js,ts}',
        'app/api/**/*.{js,ts}',
        '!**/*.d.ts',
    ],
};

module.exports = createJestConfig(customJestConfig);
