/**
 * Integration Tests for Jobs API
 */
import { POST, GET } from '@/app/api/jobs/route';
import { createMockRequest, getTestToken, mockJobData, mockUsers } from '../utils/testHelpers';
import mongoose from 'mongoose';
import Job from '@/models/Job'; // We might need to inspect DB state directly
import User from '@/models/User';

// Increase timeout for all tests in this file
jest.setTimeout(30000);

describe('Jobs API Integration Tests', () => {

    afterEach(async () => {
        await Job.deleteMany({});
        await User.deleteMany({});
    });

    describe('POST /api/jobs (Create Job)', () => {
        it('should create a job successfully when authorized as recruiter', async () => {
            // Seed the recruiter user so populate works
            await User.create(mockUsers.recruiter);

            const token = getTestToken('recruiter');
            const jobData = { ...mockJobData, company: 'Test Company ID' };
            // Note: Company ID validation might fail if it checks for existence in DB.
            // Let's create a dummy company first or mock the check?
            // The API doesn't seem to validate Company existence widely, just stores the string/ID?
            // "company" in Job model is likely a Ref.
            // Let's check Job model definition in a separate view if needed.
            // For now assuming string ID is enough if no strict populate check on create.

            const req = createMockRequest({
                method: 'POST',
                url: 'http://localhost:3000/api/jobs',
                token,
                body: jobData
            });

            const response = await POST(req as any);
            const body = await response.json();

            expect(response.status).toBe(201);
            expect(body.message).toBe('Job created successfully');
            expect(body.job.title).toBe(mockJobData.title);
            expect(body.job.recruiter.email).toBe(mockUsers.recruiter.email);

            // Verify DB state
            const dbJob = await Job.findOne({ title: mockJobData.title });
            expect(dbJob).toBeDefined();
            expect(dbJob?.title).toBe(mockJobData.title);
        });

        it('should fail if required fields are missing', async () => {
            const token = getTestToken('recruiter');
            const invalidData = { description: 'Missing title' };

            const req = createMockRequest({
                method: 'POST',
                token,
                body: invalidData
            });

            const response = await POST(req as any);
            expect(response.status).toBe(400); // Or whatever validation status
        });

        it('should return 403 Forbidden for job-seeker', async () => {
            const token = getTestToken('job-seeker');
            const req = createMockRequest({
                method: 'POST',
                token,
                body: mockJobData
            });

            const response = await POST(req as any);
            expect(response.status).toBe(403);
        });

        it('should return 401 Unauthorized for unauthenticated user', async () => {
            const req = createMockRequest({
                method: 'POST',
                body: mockJobData
            });

            const response = await POST(req as any);
            expect(response.status).toBe(401); // requireAuth throws Unauthorized
        });
    });

    describe('GET /api/jobs', () => {
        it('should return empty list initially', async () => {
            const req = createMockRequest({ method: 'GET', url: 'http://localhost:3000/api/jobs' });
            const response = await GET(req as any);
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.jobs).toEqual([]); // Provided DB is cleared
        });

        it('should return listed jobs', async () => {
            // Seed a job
            const token = getTestToken('recruiter');
            const seedReq = createMockRequest({
                method: 'POST',
                token,
                body: { ...mockJobData, company: 'Seed Co' }
            });
            await POST(seedReq as any);

            // Fetch
            const req = createMockRequest({ method: 'GET' });
            const response = await GET(req as any);
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.jobs).toHaveLength(1);
            expect(body.jobs[0].title).toBe(mockJobData.title);
        });
    });
});
