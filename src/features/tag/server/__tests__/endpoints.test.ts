import { createTestClient, setupTestAuth, type TestAuthSetup } from '@/../test/utils';
import { beforeAll, describe, expect, it } from 'vitest';

// Response validation helper functions
const validateTagResponse = (tag: any) => {
    expect(tag).toHaveProperty('id');
    expect(tag).toHaveProperty('name');
    expect(tag).toHaveProperty('color');
    expect(tag).toHaveProperty('userId');
    expect(tag).toHaveProperty('isActive');
    expect(tag).toHaveProperty('createdAt');
    expect(tag).toHaveProperty('updatedAt');
    expect(tag).toHaveProperty('transactionCount');
    expect(tag).toHaveProperty('description');
    
    expect(typeof tag.id).toBe('string');
    expect(typeof tag.name).toBe('string');
    expect(typeof tag.color).toBe('string');
    expect(typeof tag.userId).toBe('string');
    expect(typeof tag.isActive).toBe('boolean');
    expect(typeof tag.createdAt).toBe('string');
    expect(typeof tag.updatedAt).toBe('string');
    expect(typeof tag.transactionCount).toBe('number');
    // description can be null or string
};

describe('Tag API Endpoints', () => {
    let auth: TestAuthSetup;

    beforeAll(async () => {
        auth = await setupTestAuth();
    });

    describe('Authentication Tests', () => {
        const client = createTestClient();

        it('should reject unauthenticated requests', async () => {
            const res = await client.api.tags.$get({
                query: {},
            });

            expect(res.status).toBe(401);
        });

        it('should accept authenticated requests', async () => {
            const res = await client.api.tags.$get({ query: {} }, { headers: auth.authHeaders });

            expect(res.status).toBe(200);
            const tags = await res.json();
            expect(Array.isArray(tags)).toBe(true);
        });
    });

    describe('Tag CRUD Operations', () => {
        const client = createTestClient();
        let createdTagId: string;

        it('should create a tag', async () => {
            const tagData = {
                name: 'Test Tag',
                description: 'Test description',
                color: '#6366f1',
            };

            const res = await client.api.tags.$post(
                { json: tagData },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(201);

            if (res.status === 201) {
                const tag = await res.json();
                validateTagResponse(tag);
                expect(tag.name).toBe(tagData.name);
                expect(tag.description).toBe(tagData.description);
                expect(tag.color).toBe(tagData.color);
                expect(tag.transactionCount).toBe(0);
                createdTagId = tag.id;
            }
        });

        it('should get tag by ID', async () => {
            if (!createdTagId) return;

            const res = await client.api.tags[':id'].$get(
                { param: { id: createdTagId } },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);

            if (res.status === 200) {
                const tag = await res.json();
                validateTagResponse(tag);
                expect(tag.id).toBe(createdTagId);
                expect(tag.name).toBe('Test Tag');
            }
        });

        it('should update tag', async () => {
            if (!createdTagId) return;

            const updateData = { name: 'Updated Tag', color: '#ff6b6b' };
            const res = await client.api.tags[':id'].$put(
                {
                    param: { id: createdTagId },
                    json: updateData,
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);

            if (res.status === 200) {
                const tag = await res.json();
                validateTagResponse(tag);
                expect(tag.id).toBe(createdTagId);
                expect(tag.name).toBe(updateData.name);
                expect(tag.color).toBe(updateData.color);
            }
        });

        it('should delete tag', async () => {
            if (!createdTagId) return;

            const res = await client.api.tags[':id'].$delete(
                { param: { id: createdTagId } },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);

            if (res.status === 200) {
                const response = await res.json();
                expect(response).toEqual({ success: true });
            }

            // Verify tag is actually deleted
            const getRes = await client.api.tags[':id'].$get(
                { param: { id: createdTagId } },
                { headers: auth.authHeaders }
            );
            expect(getRes.status).toBe(404);
        });
    });

    describe('Input Validation', () => {
        const client = createTestClient();

        it('should validate required fields', async () => {
            const res = await client.api.tags.$post(
                {
                    // @ts-expect-error - Missing required name
                    json: { color: '#6366f1' }, // Missing required name
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(400);
        });

        it('should validate color format', async () => {
            const res = await client.api.tags.$post(
                {
                    json: {
                        name: 'Test',
                        color: 'invalid-color',
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(400);
        });

        it('should validate name length', async () => {
            const res = await client.api.tags.$post(
                {
                    json: {
                        name: '', // Empty name
                        color: '#6366f1',
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(400);
        });
    });

    describe('Tag Assignment', () => {
        const client = createTestClient();

        it('should handle tag assignment to non-existent transaction', async () => {
            const transactionId = 'non-existent-transaction-id';
            const tagIds = ['test-tag-1', 'test-tag-2'];

            const res = await client.api.tags.assign[':transactionId'].$put(
                {
                    param: { transactionId },
                    json: { tagIds },
                },
                { headers: auth.authHeaders }
            );

            // Should return 404 for non-existent transaction or 500 due to foreign key constraint
            expect([404, 500]).toContain(res.status);
        });

        it('should validate tag assignment request structure', async () => {
            const transactionId = 'any-transaction-id';

            const res = await client.api.tags.assign[':transactionId'].$put(
                {
                    param: { transactionId },
                    // @ts-expect-error - Missing required tagIds
                    json: {}, // Missing tagIds
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(400);
        });
    });
});
