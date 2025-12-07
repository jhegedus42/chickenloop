/**
 * Test utilities for integration tests
 */
import { generateToken } from '@/lib/jwt';

// Mock user data for tests
export const mockUsers = {
    recruiter: {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        email: 'recruiter@test.com',
        name: 'Test Recruiter',
        role: 'recruiter' as const,
    },
    jobSeeker: {
        _id: { toString: () => '507f1f77bcf86cd799439012' },
        email: 'jobseeker@test.com',
        name: 'Test Job Seeker',
        role: 'job-seeker' as const,
    },
    admin: {
        _id: { toString: () => '507f1f77bcf86cd799439013' },
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin' as const,
    },
};

/**
 * Generate a test JWT token for a given role
 */
export function getTestToken(role: 'recruiter' | 'job-seeker' | 'admin'): string {
    const user = role === 'recruiter'
        ? mockUsers.recruiter
        : role === 'job-seeker'
            ? mockUsers.jobSeeker
            : mockUsers.admin;

    return generateToken(user as any);
}

/**
 * Create mock NextRequest with auth token
 */
export function createMockRequest(options: {
    method?: string;
    url?: string;
    token?: string;
    body?: object;
}): Request {
    const { method = 'GET', url = 'http://localhost:3000/api/test', token, body } = options;

    const headers = new Headers();
    if (token) {
        headers.set('Cookie', `token=${token}`);
    }
    if (body) {
        headers.set('Content-Type', 'application/json');
    }

    return new Request(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
}

/**
 * Mock job data
 */
export const mockJobData = {
    title: 'Kitesurfing Instructor',
    description: 'Teaching kitesurfing to beginners',
    location: 'Tarifa, Spain',
    country: 'ES',
    salary: '2000-3000 EUR/month',
    type: 'full-time',
    sports: ['Kitesurfing'],
    languages: ['English', 'Spanish'],
};

/**
 * Mock company data
 */
export const mockCompanyData = {
    name: 'Test Watersports School',
    description: 'A test watersports school',
    coordinates: { latitude: 36.0128, longitude: -5.6037 },
    address: {
        street: '123 Beach Road',
        city: 'Tarifa',
        country: 'ES',
    },
};

/**
 * Mock CV data
 */
export const mockCvData = {
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    summary: 'Experienced watersports instructor',
    skills: ['Kitesurfing', 'Windsurfing'],
};
