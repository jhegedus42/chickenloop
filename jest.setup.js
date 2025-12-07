import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.MONGODB_URI = 'mongodb://localhost:27017/chickenloop-test';

// Mock console.error to reduce noise in tests
const originalError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === 'string' &&
            args[0].includes('Warning: ReactDOM.render')
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});
