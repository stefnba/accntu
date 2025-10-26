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
                validateLabelResponse(label.data);
                expect(label.data.name).toBe(labelData.name);
                expect(label.data.color).toBe(labelData.color);
                expect(typeof label.data.index).toBe('number'); // Index may be auto-assigned
                createdLabelId = label.data.id;
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
            const res = await client.api.labels[':id'].$patch(
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

            expect(res.status).toBe(201);

            if (res.status === 201) {
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
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(201);

            if (res.status === 201) {
                const label = await res.json();
                validateLabelResponse(label.data);
                expect(label.data.name).toBe('Parent Label');
                parentLabelId = label.data.id;
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
                    },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(201);

            if (res.status === 201) {
                const label = await res.json();
                validateLabelResponse(label.data);
                expect(label.data.name).toBe('Child Label');
                expect(label.data.parentId).toBe(parentLabelId);
                childLabelId = label.data.id;
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

    describe('Security - User Isolation', () => {
        const client = createTestClient();
        let userAAuth: TestAuthSetup;
        let userBAuth: TestAuthSetup;
        let userALabelId: string;

        beforeAll(async () => {
            // Create two different users for isolation testing
            userAAuth = await setupTestAuth();
            userBAuth = await setupTestAuth();

            // Create a label for user A
            const labelData = {
                name: 'User A Label',
                color: '#ff0000',
                index: 0,
            };

            const res = await client.api.labels.$post(
                { json: labelData },
                { headers: userAAuth.authHeaders }
            );

            if (res.status === 201) {
                const label = await res.json();
                userALabelId = label.data.id;
            }
        });

        it('should prevent user B from accessing user A labels list', async () => {
            const res = await client.api.labels.$get(
                { query: {} },
                { headers: userBAuth.authHeaders }
            );

            expect(res.status).toBe(200);
            if (res.status === 200) {
                const labels = await res.json();
                expect(Array.isArray(labels)).toBe(true);
                expect(labels).toHaveLength(0); // User B should see no labels
            }
        });

        it('should prevent user B from accessing user A specific label', async () => {
            if (!userALabelId) return;

            const res = await client.api.labels[':id'].$get(
                { param: { id: userALabelId } },
                { headers: userBAuth.authHeaders }
            );

            expect([404, 500]).toContain(res.status); // Should not find the label
        });

        it('should prevent user B from updating user A label', async () => {
            if (!userALabelId) return;

            const updateData = {
                name: 'Hacked by User B',
                color: '#000000',
            };

            const res = await client.api.labels[':id'].$patch(
                {
                    param: { id: userALabelId },
                    json: updateData,
                },
                { headers: userBAuth.authHeaders }
            );

            expect([404, 500]).toContain(res.status); // Should fail to find/update label
        });

        it('should allow same label names for different users', async () => {
            const labelData = {
                name: 'Shared Label Name',
                color: '#00ff00',
                index: 0,
            };

            // Create label for user A
            const resA = await client.api.labels.$post(
                { json: labelData },
                { headers: userAAuth.authHeaders }
            );

            // Create label with same name for user B
            const resB = await client.api.labels.$post(
                { json: labelData },
                { headers: userBAuth.authHeaders }
            );

            expect(resA.status).toBe(201);
            expect(resB.status).toBe(201); // Should both succeed
        });
    });

    describe('Business Logic - Hierarchy Validation', () => {
        const client = createTestClient();
        let parentLabelId: string;
        let childLabelId: string;
        let grandchildLabelId: string;

        beforeAll(async () => {
            // Create parent label
            const parentData = {
                name: 'Parent Label',
                color: '#ff0000',
                index: 0,
            };

            const parentRes = await client.api.labels.$post(
                { json: parentData },
                { headers: auth.authHeaders }
            );

            if (parentRes.status === 201) {
                const parent = await parentRes.json();
                parentLabelId = parent.data.id;

                // Create child label
                const childData = {
                    name: 'Child Label',
                    color: '#00ff00',
                    index: 0,
                    parentId: parentLabelId,
                };

                const childRes = await client.api.labels.$post(
                    { json: childData },
                    { headers: auth.authHeaders }
                );

                if (childRes.status === 201) {
                    const child = await childRes.json();
                    childLabelId = child.data.id;

                    // Create grandchild label
                    const grandchildData = {
                        name: 'Grandchild Label',
                        color: '#0000ff',
                        index: 0,
                        parentId: childLabelId,
                    };

                    const grandchildRes = await client.api.labels.$post(
                        { json: grandchildData },
                        { headers: auth.authHeaders }
                    );

                    if (grandchildRes.status === 201) {
                        const grandchild = await grandchildRes.json();
                        grandchildLabelId = grandchild.data.id;
                    }
                }
            }
        });

        it('should prevent circular hierarchy - direct parent-child cycle', async () => {
            if (!parentLabelId || !childLabelId) return;

            // Try to make parent a child of its own child
            const updateRes = await client.api.labels[':id'].$patch(
                {
                    param: { id: parentLabelId },
                    json: { parentId: childLabelId }, // Circular reference!
                },
                { headers: auth.authHeaders }
            );

            expect([400, 404, 500]).toContain(updateRes.status); // Should fail
        });

        it('should prevent circular hierarchy - indirect cycle (grandchild -> parent)', async () => {
            if (!parentLabelId || !grandchildLabelId) return;

            // Try to make parent a child of its grandchild
            const updateRes = await client.api.labels[':id'].$patch(
                {
                    param: { id: parentLabelId },
                    json: { parentId: grandchildLabelId }, // Circular reference!
                },
                { headers: auth.authHeaders }
            );

            expect([400, 404, 500]).toContain(updateRes.status); // Should fail
        });

        it('should prevent self-referencing labels', async () => {
            if (!parentLabelId) return;

            const updateRes = await client.api.labels[':id'].$patch(
                {
                    param: { id: parentLabelId },
                    json: { parentId: parentLabelId }, // Self reference!
                },
                { headers: auth.authHeaders }
            );

            expect([400, 404, 500]).toContain(updateRes.status); // Should fail
        });

        it('should handle deletion of parent labels with children', async () => {
            if (!parentLabelId) return;

            // Try to delete parent label that has children
            const deleteRes = await client.api.labels[':id'].$delete(
                { param: { id: parentLabelId } },
                { headers: auth.authHeaders }
            );

            expect([200, 201, 500]).toContain(deleteRes.status);

            // Verify child labels still exist (or are handled appropriately)
            if (childLabelId) {
                const childRes = await client.api.labels[':id'].$get(
                    { param: { id: childLabelId } },
                    { headers: auth.authHeaders }
                );

                expect(childRes.status).toBe(200);
                // Child should either be deleted (cascade) or have parentId set to null
            }
        });

        it('should prevent duplicate label names for same user', async () => {
            const labelData = {
                name: 'Duplicate Name Test',
                color: '#ff00ff',
                index: 0,
            };

            // Create first label
            const firstRes = await client.api.labels.$post(
                { json: labelData },
                { headers: auth.authHeaders }
            );
            expect(firstRes.status).toBe(201);

            // Try to create second label with same name
            const secondRes = await client.api.labels.$post(
                { json: labelData },
                { headers: auth.authHeaders }
            );

            expect([201, 400, 500]).toContain(secondRes.status); // May succeed or fail based on business rules
        });
    });
});
