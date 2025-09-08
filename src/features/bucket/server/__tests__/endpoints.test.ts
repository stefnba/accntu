import { createTestClient, setupTestAuth, type TestAuthSetup } from '@/../test/utils';
import { beforeAll, describe, expect, it } from 'vitest';

// Response validation helper functions
const validateBucketResponse = (bucket: any) => {
    expect(bucket).toHaveProperty('id');
    expect(bucket).toHaveProperty('title');
    expect(bucket).toHaveProperty('type');
    expect(bucket).toHaveProperty('status');
    expect(bucket).toHaveProperty('totalTransactions');
    expect(bucket).toHaveProperty('openTransactions');
    expect(bucket).toHaveProperty('settledTransactions');
    expect(bucket).toHaveProperty('totalAmount');
    expect(bucket).toHaveProperty('openAmount');
    expect(bucket).toHaveProperty('settledAmount');
    expect(bucket).toHaveProperty('userId');
    expect(bucket).toHaveProperty('isActive');
    expect(bucket).toHaveProperty('createdAt');
    expect(bucket).toHaveProperty('updatedAt');
    
    expect(typeof bucket.id).toBe('string');
    expect(typeof bucket.title).toBe('string');
    expect(typeof bucket.type).toBe('string');
    expect(typeof bucket.status).toBe('string');
    expect(typeof bucket.totalTransactions).toBe('number');
    expect(typeof bucket.openTransactions).toBe('number');
    expect(typeof bucket.settledTransactions).toBe('number');
    expect(typeof bucket.totalAmount).toBe('string');
    expect(typeof bucket.openAmount).toBe('string');
    expect(typeof bucket.settledAmount).toBe('string');
    expect(typeof bucket.userId).toBe('string');
    expect(typeof bucket.isActive).toBe('boolean');
    expect(typeof bucket.createdAt).toBe('string');
    expect(typeof bucket.updatedAt).toBe('string');
};

describe('Bucket API Endpoints', () => {
    let auth: TestAuthSetup;

    beforeAll(async () => {
        auth = await setupTestAuth();
    });

    describe('Authentication Tests', () => {
        const client = createTestClient();

        it('should reject unauthenticated requests', async () => {
            const res = await client.api.buckets.$get({
                query: {},
            });

            expect(res.status).toBe(401);
        });

        it('should accept authenticated requests', async () => {
            const res = await client.api.buckets.$get({ query: {} }, { headers: auth.authHeaders });

            expect(res.status).toBe(200);
            
            if (res.status === 200) {
                const buckets = await res.json();
                expect(Array.isArray(buckets)).toBe(true);
            }
        });
    });

    describe('Bucket CRUD Operations', () => {
        const client = createTestClient();
        let createdBucketId: string;

        it('should create a bucket', async () => {
            const bucketData = {
                title: 'Test Trip Bucket',
                type: 'trip' as const,
                status: 'open' as const,
            };

            const res = await client.api.buckets.$post(
                { json: bucketData },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(201);
            
            if (res.status === 201) {
                const bucket = await res.json();
                validateBucketResponse(bucket);
                expect(bucket.title).toBe(bucketData.title);
                expect(bucket.type).toBe(bucketData.type);
                expect(bucket.status).toBe(bucketData.status);
                expect(bucket.totalTransactions).toBe(0);
                expect(bucket.totalAmount).toBe('0.00');
                createdBucketId = bucket.id;
            }
        });

        it('should get bucket by ID', async () => {
            if (!createdBucketId) return;

            const res = await client.api.buckets[':id'].$get(
                { param: { id: createdBucketId } },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);
            
            if (res.status === 200) {
                const bucket = await res.json();
                validateBucketResponse(bucket);
                expect(bucket.id).toBe(createdBucketId);
                expect(bucket.title).toBe('Test Trip Bucket');
            }
        });

        it('should update bucket', async () => {
            if (!createdBucketId) return;

            const updateData = { title: 'Updated Trip Bucket', type: 'project' as const };
            const res = await client.api.buckets[':id'].$put(
                {
                    param: { id: createdBucketId },
                    json: updateData,
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);
            
            if (res.status === 200) {
                const bucket = await res.json();
                validateBucketResponse(bucket);
                expect(bucket.id).toBe(createdBucketId);
                expect(bucket.title).toBe(updateData.title);
                expect(bucket.type).toBe(updateData.type);
            }
        });

        it('should delete bucket', async () => {
            if (!createdBucketId) return;

            const res = await client.api.buckets[':id'].$delete(
                { param: { id: createdBucketId } },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);
            
            if (res.status === 200) {
                const response = await res.json();
                expect(response).toEqual({ success: true });
            }

            // Verify bucket is actually deleted
            const getRes = await client.api.buckets[':id'].$get(
                { param: { id: createdBucketId } },
                { headers: auth.authHeaders }
            );
            expect(getRes.status).toBe(500);
        });
    });

    describe('Input Validation', () => {
        const client = createTestClient();

        it('should validate required fields', async () => {
            const res = await client.api.buckets.$post(
                {
                    // @ts-expect-error - Missing required title
                    json: { type: 'trip' }, // Missing required title
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(400);
        });

        it('should validate bucket type enum', async () => {
            const res = await client.api.buckets.$post(
                {
                    json: {
                        title: 'Test Bucket',
                        // @ts-expect-error - Invalid type
                        type: 'invalid-type',
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(400);
        });

        it('should validate bucket status enum', async () => {
            const res = await client.api.buckets.$post(
                {
                    json: {
                        title: 'Test Bucket',
                        type: 'trip',
                        // @ts-expect-error - Invalid status
                        status: 'invalid-status',
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(400);
        });

        it('should validate title length', async () => {
            const res = await client.api.buckets.$post(
                {
                    json: {
                        title: '', // Empty title
                        type: 'trip',
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(400);
        });
    });

    describe('Bucket Type Operations', () => {
        const client = createTestClient();

        it('should create bucket with different types', async () => {
            const types = ['trip', 'home', 'project', 'event', 'other'] as const;
            
            for (const type of types) {
                const res = await client.api.buckets.$post(
                    {
                        json: {
                            title: `Test ${type} Bucket`,
                            type,
                        },
                    },
                    { headers: auth.authHeaders }
                );

                expect(res.status).toBe(201);
                
                if (res.status === 201) {
                    const bucket = await res.json();
                    validateBucketResponse(bucket);
                    expect(bucket.type).toBe(type);
                    expect(bucket.title).toBe(`Test ${type} Bucket`);
                }
            }
        });

        it('should create bucket with different statuses', async () => {
            const statuses = ['open', 'settled'] as const;
            
            for (const status of statuses) {
                const res = await client.api.buckets.$post(
                    {
                        json: {
                            title: `Test ${status} Bucket`,
                            type: 'trip',
                            status,
                        },
                    },
                    { headers: auth.authHeaders }
                );

                expect(res.status).toBe(201);
                
                if (res.status === 201) {
                    const bucket = await res.json();
                    validateBucketResponse(bucket);
                    expect(bucket.status).toBe(status);
                    expect(bucket.title).toBe(`Test ${status} Bucket`);
                }
            }
        });
    });

    describe('Pagination and Filtering', () => {
        const client = createTestClient();

        it('should handle pagination', async () => {
            const res = await client.api.buckets.$get(
                {
                    query: {
                        page: 1,
                        pageSize: 10,
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);
            
            if (res.status === 200) {
                const buckets = await res.json();
                expect(Array.isArray(buckets)).toBe(true);
            }
        });

        // Note: Bucket schema only supports 'search' filtering, not 'type' or 'status' filtering

        it('should handle search filtering', async () => {
            const res = await client.api.buckets.$get(
                {
                    query: {
                        search: 'test',
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);
            
            if (res.status === 200) {
                const buckets = await res.json();
                expect(Array.isArray(buckets)).toBe(true);
            }
        });
    });
});