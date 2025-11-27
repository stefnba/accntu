import { createTestClient, setupTestAuth, type TestAuthSetup } from '@/../test/utils';
import { beforeAll, describe, expect, it } from 'vitest';

// Response validation helper functions

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            const res = await client.api.tags.$get();

            expect(res.status).toBe(401);
        });

        it('should accept authenticated requests', async () => {
            const res = await client.api.tags.$get({}, { headers: auth.authHeaders });

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
                const response = await res.json();
                expect(response).toHaveProperty('success', true);
                expect(response).toHaveProperty('data');
                const tag = response.data;
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
            const res = await client.api.tags[':id'].$patch(
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

            expect(res.status).toBe(201);

            if (res.status === 201) {
                const response = await res.json();
                expect(response).toHaveProperty('success', true);
            }

            // Verify tag is actually deleted (should return 404)
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

            expect(res.status).toBe(404);
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

    describe('Security - User Isolation', () => {
        const client = createTestClient();
        let userAAuth: TestAuthSetup;
        let userBAuth: TestAuthSetup;
        let userATagId: string;

        beforeAll(async () => {
            // Create two different users for isolation testing
            userAAuth = await setupTestAuth();
            userBAuth = await setupTestAuth();

            // Create a tag for user A
            const tagData = {
                name: 'User A Tag',
                color: '#ff0000',
                description: 'User A private tag',
            };

            const res = await client.api.tags.$post(
                { json: tagData },
                { headers: userAAuth.authHeaders }
            );

            if (res.status === 201) {
                const response = await res.json();
                userATagId = response.data.id;
            }
        });

        it('should prevent user B from accessing user A tags list', async () => {
            const res = await client.api.tags.$get(
                { query: {} },
                { headers: userBAuth.authHeaders }
            );

            expect(res.status).toBe(200);
            if (res.status === 200) {
                const tags = await res.json();
                expect(Array.isArray(tags)).toBe(true);
                expect(tags).toHaveLength(0); // User B should see no tags
            }
        });

        it('should prevent user B from accessing user A specific tag', async () => {
            if (!userATagId) return;

            const res = await client.api.tags[':id'].$get(
                { param: { id: userATagId } },
                { headers: userBAuth.authHeaders }
            );

            expect(res.status).toBe(404); // Should not find the tag
        });

        it('should prevent user B from updating user A tag', async () => {
            if (!userATagId) return;

            const updateData = {
                name: 'Hacked by User B',
                color: '#000000',
            };

            const res = await client.api.tags[':id'].$patch(
                {
                    param: { id: userATagId },
                    json: updateData,
                },
                { headers: userBAuth.authHeaders }
            );

            expect([404, 500]).toContain(res.status); // Should fail to find tag to update
        });

        it('should allow same tag names for different users', async () => {
            const tagData = {
                name: 'Shared Tag Name',
                color: '#00ff00',
            };

            // Create tag for user A
            const resA = await client.api.tags.$post(
                { json: tagData },
                { headers: userAAuth.authHeaders }
            );

            // Create tag with same name for user B
            const resB = await client.api.tags.$post(
                { json: tagData },
                { headers: userBAuth.authHeaders }
            );

            expect(resA.status).toBe(201);
            expect(resB.status).toBe(201); // Should both succeed
        });
    });

    describe('Business Logic - Tag Management', () => {
        const client = createTestClient();

        it('should prevent duplicate tag names for same user', async () => {
            const tagData = {
                name: 'Duplicate Tag Test',
                color: '#ff00ff',
            };

            // Create first tag
            const firstRes = await client.api.tags.$post(
                { json: tagData },
                { headers: auth.authHeaders }
            );
            expect(firstRes.status).toBe(201);

            // Try to create second tag with same name
            const secondRes = await client.api.tags.$post(
                { json: tagData },
                { headers: auth.authHeaders }
            );

            expect([400, 409, 500]).toContain(secondRes.status); // Should fail with conflict
        });

        it('should handle tag assignment to non-existent transaction gracefully', async () => {
            // Create a tag first
            const tagData = {
                name: 'Assignment Test Tag',
                color: '#0000ff',
            };

            const tagRes = await client.api.tags.$post(
                { json: tagData },
                { headers: auth.authHeaders }
            );

            expect(tagRes.status).toBe(201);

            if (tagRes.status === 201) {
                const response = await tagRes.json();
                const tagId = response.data.id;

                // Try to assign tag to non-existent transaction
                const assignRes = await client.api.tags.assign[':transactionId'].$put(
                    {
                        param: { transactionId: 'non-existent-transaction-id' },
                        json: { tagIds: [tagId] },
                    },
                    { headers: auth.authHeaders }
                );

                expect([400, 404, 500]).toContain(assignRes.status); // Should fail gracefully
            }
        });

        it('should validate tag assignment permissions', async () => {
            // This test would require creating a transaction to properly test tag assignment
            // For now, we test the error handling of invalid requests

            const res = await client.api.tags.assign[':transactionId'].$put(
                {
                    param: { transactionId: 'invalid-transaction-id' },
                    json: { tagIds: ['invalid-tag-id'] },
                },
                { headers: auth.authHeaders }
            );

            expect([400, 404, 500]).toContain(res.status); // Should handle invalid data gracefully
        });
    });
});
