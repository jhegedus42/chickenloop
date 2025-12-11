import '@testing-library/jest-dom';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Mock environment variables are set before imports in tests if needed, 
// but here we set defaults and handle the DB connection.
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';

// Mock @vercel/blob
jest.mock('@vercel/blob', () => ({
    put: jest.fn().mockImplementation(() => Promise.resolve({
        url: 'https://k52q80.public.blob.vercel-storage.com/test-image.png',
        pathname: 'test-image.png',
        contentType: 'image/png',
        contentDisposition: 'inline'
    })),
    del: jest.fn().mockImplementation(() => Promise.resolve()),
    list: jest.fn().mockImplementation(() => Promise.resolve({ blobs: [] })),
}));

let mongod;

beforeAll(async () => {
    // Start in-memory MongoDB instance
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;
    await mongoose.connect(uri);
}, 60000);

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    if (mongod) {
        await mongod.stop();
    }
});

afterEach(async () => {
    // Clear all data between tests
    if (mongoose.connection.readyState !== 0) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    }
});

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
