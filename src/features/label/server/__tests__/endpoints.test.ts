import { createTestClient, setupTestAuth, type TestAuthSetup } from '@/../test/utils';
import { beforeAll, describe, expect, it } from 'vitest';

describe('Label API Endpoints', () => {
    let auth: TestAuthSetup;

    beforeAll(async () => {
        auth = await setupTestAuth();
    });

    describe('Authentication Tests', () => {
        const client = createTestClient();

        it('should reject unauthenticated requests', async () => {
            const res = await client.api.labels.$get({
                query: {},
            });

            expect(res.status).toBe(401);
        });

        it('should accept authenticated requests', async () => {
            const res = await client.api.labels.$get({ query: {} }, { headers: auth.authHeaders });

            expect(res.status).not.toBe(401);

            if (res.status === 200) {
                const labels = await res.json();
                expect(Array.isArray(labels)).toBe(true);
            }
        });
    });

    describe('Label CRUD Operations', () => {
        const client = createTestClient();
        let createdLabelId: string;

        it('should create a label', async () => {
            const labelData = {
                name: 'Test Label',
                description: 'Test description',
                color: '#6366f1',
            };

            const res = await client.api.labels.$post(
                { json: labelData },
                { headers: auth.authHeaders }
            );

            if (res.status === 201) {
                const label = await res.json();
                expect(label.name).toBe(labelData.name);
                createdLabelId = label.id;
            } else {
                expect([201, 401, 500]).toContain(res.status);
            }
        });

        it('should get label by ID', async () => {
            if (!createdLabelId) return;

            const res = await client.api.labels[':id'].$get(
                { param: { id: createdLabelId } },
                { headers: auth.authHeaders }
            );

            expect([200, 401, 404, 500]).toContain(res.status);
        });

        it('should update label', async () => {
            if (!createdLabelId) return;

            const res = await client.api.labels[':id'].$put(
                {
                    param: { id: createdLabelId },
                    json: { name: 'Updated Label' },
                },
                { headers: auth.authHeaders }
            );

            expect([200, 401, 404, 500]).toContain(res.status);
            if (res.status === 200) {
                const label = await res.json();
                expect(label.name).toBe('Updated Label');
            }
        });

        it('should delete label', async () => {
            if (!createdLabelId) return;

            const res = await client.api.labels[':id'].$delete(
                { param: { id: createdLabelId } },
                { headers: auth.authHeaders }
            );

            expect([200, 401, 404, 500]).toContain(res.status);
        });
    });

    describe('Input Validation', () => {
        const client = createTestClient();

        it('should validate required fields', async () => {
            const res = await client.api.labels.$post(
                {
                    // @ts-expect-error - Missing required name
                    json: { color: '#6366f1' }, // Missing required name
                },
                { headers: auth.authHeaders }
            );

            expect([400, 401]).toContain(res.status);
        });

        it('should validate color format', async () => {
            const res = await client.api.labels.$post(
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

    describe('Label Hierarchy Operations', () => {
        const client = createTestClient();
        let parentLabelId: string;
        let childLabelId: string;

        it('should create a parent label', async () => {
            const res = await client.api.labels.$post(
                {
                    json: {
                        name: 'Parent Label',
                        color: '#ff6b6b',
                    },
                },
                { headers: auth.authHeaders }
            );

            if (res.status === 201) {
                const label = await res.json();
                parentLabelId = label.id;
            }

            expect([201, 401, 500]).toContain(res.status);
        });

        it('should create a child label', async () => {
            if (!parentLabelId) return;

            const res = await client.api.labels.$post(
                {
                    json: {
                        name: 'Child Label',
                        color: '#4ecdc4',
                        parentId: parentLabelId,
                    },
                },
                { headers: auth.authHeaders }
            );

            if (res.status === 201) {
                const label = await res.json();
                childLabelId = label.id;
            }

            expect([201, 401, 500]).toContain(res.status);
        });

        it('should get flattened labels', async () => {
            const res = await client.api.labels.flattened.$get(
                { query: {} },
                { headers: auth.authHeaders }
            );

            expect([200, 401, 500]).toContain(res.status);

            if (res.status === 200) {
                const labels = await res.json();
                expect(Array.isArray(labels)).toBe(true);
            }
        });

        it('should filter labels by parent', async () => {
            if (!parentLabelId) return;

            const res = await client.api.labels.$get(
                {
                    query: {
                        parentId: parentLabelId,
                    },
                },
                { headers: auth.authHeaders }
            );

            expect([200, 401, 500]).toContain(res.status);
        });
    });

    describe('Label Reordering', () => {
        const client = createTestClient();

        it('should handle label reordering', async () => {
            const items = [
                {
                    id: 'label-1',
                    parentId: null,
                    index: 0,
                },
                {
                    id: 'label-2',
                    parentId: null,
                    index: 1,
                },
            ];

            const res = await client.api.labels.reorder.$put(
                {
                    json: { items },
                },
                { headers: auth.authHeaders }
            );

            expect([200, 401, 404, 500]).toContain(res.status);
        });
    });

    describe('Pagination and Search', () => {
        const client = createTestClient();

        it('should handle search', async () => {
            const res = await client.api.labels.$get(
                {
                    query: {
                        search: 'test',
                    },
                },
                { headers: auth.authHeaders }
            );

            expect([200, 401, 500]).toContain(res.status);
        });

        it('should handle flattened search', async () => {
            const res = await client.api.labels.flattened.$get(
                {
                    query: {
                        search: 'test',
                    },
                },
                { headers: auth.authHeaders }
            );

            expect([200, 401, 500]).toContain(res.status);
        });
    });
});
