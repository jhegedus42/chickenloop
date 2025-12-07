import jwt from 'jsonwebtoken';
import { generateToken, verifyToken, JWTPayload } from '@/lib/jwt';

// Mock the IUser type (minimal mock)
interface MockUser {
    _id: { toString: () => string };
    email: string;
    role: string;
}

describe('jwt', () => {
    const mockUser: MockUser = {
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        email: 'test@example.com',
        role: 'recruiter',
    };

    describe('generateToken', () => {
        it('generates a valid JWT token', () => {
            const token = generateToken(mockUser as any);
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
        });

        it('includes correct payload in token', () => {
            const token = generateToken(mockUser as any);
            const decoded = jwt.decode(token) as JWTPayload;

            expect(decoded.userId).toBe('507f1f77bcf86cd799439011');
            expect(decoded.email).toBe('test@example.com');
            expect(decoded.role).toBe('recruiter');
        });
    });

    describe('verifyToken', () => {
        it('verifies a valid token and returns payload', () => {
            const token = generateToken(mockUser as any);
            const payload = verifyToken(token);

            expect(payload.userId).toBe('507f1f77bcf86cd799439011');
            expect(payload.email).toBe('test@example.com');
            expect(payload.role).toBe('recruiter');
        });

        it('throws error for invalid token', () => {
            expect(() => verifyToken('invalid-token')).toThrow('Invalid or expired token');
        });

        it('throws error for tampered token', () => {
            const token = generateToken(mockUser as any);
            const tamperedToken = token.slice(0, -10) + 'xxxxxxxxxx';
            expect(() => verifyToken(tamperedToken)).toThrow('Invalid or expired token');
        });
    });
});
