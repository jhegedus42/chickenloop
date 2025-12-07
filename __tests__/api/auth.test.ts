/**
 * Integration tests for authentication logic
 * 
 * Tests the auth helper functions and JWT/cookie flows
 * without requiring the full Next.js server runtime.
 */
import { getTestToken, mockUsers } from '../utils/testHelpers';
import { verifyToken } from '@/lib/jwt';

describe('Auth Integration Tests', () => {
    describe('Token Flow', () => {
        it('generates valid tokens for recruiter', () => {
            const token = getTestToken('recruiter');
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');

            const payload = verifyToken(token);
            expect(payload.email).toBe(mockUsers.recruiter.email);
            expect(payload.role).toBe('recruiter');
        });

        it('generates valid tokens for job-seeker', () => {
            const token = getTestToken('job-seeker');
            const payload = verifyToken(token);

            expect(payload.email).toBe(mockUsers.jobSeeker.email);
            expect(payload.role).toBe('job-seeker');
        });

        it('generates valid tokens for admin', () => {
            const token = getTestToken('admin');
            const payload = verifyToken(token);

            expect(payload.email).toBe(mockUsers.admin.email);
            expect(payload.role).toBe('admin');
        });

        it('includes user ID in token payload', () => {
            const token = getTestToken('recruiter');
            const payload = verifyToken(token);

            expect(payload.userId).toBe('507f1f77bcf86cd799439011');
        });

        it('generates different tokens per role', () => {
            const recruiterToken = getTestToken('recruiter');
            const adminToken = getTestToken('admin');

            expect(recruiterToken).not.toBe(adminToken);
        });
    });

    describe('Token Verification', () => {
        it('rejects invalid tokens', () => {
            expect(() => verifyToken('invalid-token')).toThrow();
        });

        it('rejects tampered tokens', () => {
            const token = getTestToken('recruiter');
            const tamperedToken = token.slice(0, -5) + 'xxxxx';
            expect(() => verifyToken(tamperedToken)).toThrow();
        });

        it('validates token structure', () => {
            const token = getTestToken('admin');
            const parts = token.split('.');
            expect(parts).toHaveLength(3);
        });
    });
});
