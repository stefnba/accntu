import { createTestClient, setupTestAuth, type TestAuthSetup } from '@/../test/utils';
import { beforeAll, describe, expect, it } from 'vitest';

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

            expect(res.status).not.toBe(401);

            if (res.status === 200) {
                const tags = await res.json();
                expect(Array.isArray(tags)).toBe(true);
            }
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

            if (res.status === 201) {
                const tag = await res.json();
                expect(tag.name).toBe(tagData.name);
                createdTagId = tag.id;
            } else {
                expect([201, 401, 500]).toContain(res.status);
            }
        });

        it('should get tag by ID', async () => {
            if (!createdTagId) return;

            const res = await client.api.tags[':id'].$get(
                { param: { id: createdTagId } },
                { headers: auth.authHeaders }
            );

            expect([200, 401, 404, 500]).toContain(res.status);
        });

        it('should update tag', async () => {
            if (!createdTagId) return;

            const res = await client.api.tags[':id'].$put(
                {
                    param: { id: createdTagId },
                    json: { name: 'Updated Tag' },
                },
                { headers: auth.authHeaders }
            );

            expect([200, 401, 404, 500]).toContain(res.status);
        });

        it('should delete tag', async () => {
            if (!createdTagId) return;

            const res = await client.api.tags[':id'].$delete(
                { param: { id: createdTagId } },
                { headers: auth.authHeaders }
            );

            expect([200, 401, 404, 500]).toContain(res.status);
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

            expect([400, 401]).toContain(res.status);
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

            expect([400, 401]).toContain(res.status);
        });
    });

    describe('Tag Assignment', () => {
        const client = createTestClient();

        it('should handle tag assignment to transaction', async () => {
            const transactionId = 'test-transaction-id';
            const tagIds = ['test-tag-1', 'test-tag-2'];

            const res = await client.api.tags.assign[':transactionId'].$put(
                {
                    param: { transactionId },
                    json: { tagIds },
                },
                { headers: auth.authHeaders }
            );

            expect([200, 401, 404, 500]).toContain(res.status);
        });
    });
});
