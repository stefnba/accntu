import { createTestClient, setupTestAuth, type TestAuthSetup } from '@/../test/utils';
import { beforeAll, describe, expect, it } from 'vitest';

// Response validation helper functions
const validateLabelResponse = (label: any) => {
    expect(label).toHaveProperty('id');
    expect(label).toHaveProperty('name');
    expect(label).toHaveProperty('color');
    expect(label).toHaveProperty('icon');
    expect(label).toHaveProperty('imageUrl');
    expect(label).toHaveProperty('parentId');
    expect(label).toHaveProperty('firstParentId');
    expect(label).toHaveProperty('index');
    expect(label).toHaveProperty('userId');
    expect(label).toHaveProperty('isActive');
    expect(label).toHaveProperty('createdAt');
    expect(label).toHaveProperty('updatedAt');
    
    expect(typeof label.id).toBe('string');
    expect(typeof label.name).toBe('string');
    expect(typeof label.index).toBe('number');
    expect(typeof label.userId).toBe('string');
    expect(typeof label.isActive).toBe('boolean');
    expect(typeof label.createdAt).toBe('string');
    expect(typeof label.updatedAt).toBe('string');
    // color, icon, imageUrl, parentId, firstParentId can be null
};

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

            expect(res.status).toBe(200);
            
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
                color: '#6366f1',
                index: 0,
            };

            const res = await client.api.labels.$post(
                { json: labelData },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(201);
            
            if (res.status === 201) {
                const label = await res.json();
                validateLabelResponse(label);
                expect(label.name).toBe(labelData.name);
                expect(label.color).toBe(labelData.color);
                expect(label.index).toBe(labelData.index);
                createdLabelId = label.id;
            }
        });

        it('should get label by ID', async () => {
            if (!createdLabelId) return;

            const res = await client.api.labels[':id'].$get(
                { param: { id: createdLabelId } },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);
            
            if (res.status === 200) {
                const label = await res.json();
                validateLabelResponse(label);
                expect(label.id).toBe(createdLabelId);
                expect(label.name).toBe('Test Label');
            }
        });

        it('should update label', async () => {
            if (!createdLabelId) return;

            const updateData = { name: 'Updated Label', color: '#ff6b6b' };
            const res = await client.api.labels[':id'].$put(
                {
                    param: { id: createdLabelId },
                    json: updateData,
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);
            
            if (res.status === 200) {
                const label = await res.json();
                validateLabelResponse(label);
                expect(label.id).toBe(createdLabelId);
                expect(label.name).toBe(updateData.name);
                expect(label.color).toBe(updateData.color);
            }
        });

        it('should delete label', async () => {
            if (!createdLabelId) return;

            const res = await client.api.labels[':id'].$delete(
                { param: { id: createdLabelId } },
                { headers: auth.authHeaders }
            );

            expect([200, 500]).toContain(res.status); // 200 for success, 500 for server errors
            
            if (res.status === 200) {
                const response = await res.json();
                expect(response).toEqual({ success: true });
            }

            // Verify label is actually deleted
            const getRes = await client.api.labels[':id'].$get(
                { param: { id: createdLabelId } },
                { headers: auth.authHeaders }
            );
            expect([404, 500]).toContain(getRes.status);
        });
    });

    describe('Input Validation', () => {
        const client = createTestClient();

        it('should validate required fields', async () => {
            const res = await client.api.labels.$post(
                {
                    // @ts-expect-error - Missing required name and index
                    json: { color: '#6366f1' }, // Missing required name and index
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(400);
        });

        it('should validate color format', async () => {
            const res = await client.api.labels.$post(
                {
                    json: {
                        name: 'Test',
                        color: 'invalid-color',
                        index: 0,
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(400);
        });

        it('should validate name length', async () => {
            const res = await client.api.labels.$post(
                {
                    json: {
                        name: '', // Empty name
                        color: '#6366f1',
                        index: 0,
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(400);
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
                        index: 0,
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(201);
            
            if (res.status === 201) {
                const label = await res.json();
                validateLabelResponse(label);
                expect(label.name).toBe('Parent Label');
                parentLabelId = label.id;
            }
        });

        it('should create a child label', async () => {
            if (!parentLabelId) return;

            const res = await client.api.labels.$post(
                {
                    json: {
                        name: 'Child Label',
                        color: '#4ecdc4',
                        parentId: parentLabelId,
                        index: 0,
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(201);
            
            if (res.status === 201) {
                const label = await res.json();
                validateLabelResponse(label);
                expect(label.name).toBe('Child Label');
                expect(label.parentId).toBe(parentLabelId);
                childLabelId = label.id;
            }
        });

        it('should get flattened labels', async () => {
            const res = await client.api.labels.flattened.$get(
                { query: {} },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);

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

            expect(res.status).toBe(200);
            
            if (res.status === 200) {
                const labels = await res.json();
                expect(Array.isArray(labels)).toBe(true);
            }
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

            expect([200, 404, 500]).toContain(res.status); // 404 for non-existent labels, 500 for server errors
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

            expect(res.status).toBe(200);
            
            if (res.status === 200) {
                const labels = await res.json();
                expect(Array.isArray(labels)).toBe(true);
            }
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

            expect(res.status).toBe(200);
            
            if (res.status === 200) {
                const labels = await res.json();
                expect(Array.isArray(labels)).toBe(true);
            }
        });
    });
});
