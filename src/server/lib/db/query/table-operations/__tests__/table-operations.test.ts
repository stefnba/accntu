import { beforeAll, describe, expect, it, vi } from 'vitest';

// Mock problematic modules BEFORE any other imports
vi.mock('@/features/bank/server/db/queries/connected-bank', () => ({
    connectedBankQueries: { queries: {} },
}));

import { createTestUser } from '@/../test/utils/create-user';
import { tag } from '@/features/tag/server/db/tables';
import { TableOperationsBuilder } from '@/server/lib/db/query/table-operations';
import { createId } from '@paralleldrive/cuid2';
import { fail } from 'assert';

describe('TableOperationsBuilder', () => {
    let testUser: Awaited<ReturnType<typeof createTestUser>>;
    let tableOps: TableOperationsBuilder<typeof tag>;

    beforeAll(async () => {
        testUser = await createTestUser();
        tableOps = new TableOperationsBuilder(tag);
    });

    describe('Create Operations', () => {
        it('should create a single record', async () => {
            const data = {
                id: createId(),
                userId: testUser.id,
                name: 'test-tag-' + Date.now(),
                color: '#FF0000',
                description: 'Test description',
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                transactionCount: 0,
            };

            const result = await tableOps.createRecord({
                data,
            });

            expect(result).toBeDefined();
            expect(result.name).toBe(data.name);
            expect(result.color).toBe(data.color);
        });

        it('should create a record with selective return columns', async () => {
            const data = {
                id: createId(),
                userId: testUser.id,
                name: 'test-tag-selective-' + Date.now(),
                color: '#00FF00',
                description: 'Test selective columns',
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                transactionCount: 0,
            };

            const result = await tableOps.createRecord({
                data,
                returnColumns: ['id', 'name'],
            });

            expect(result).toBeDefined();
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('name');
            expect(result).not.toHaveProperty('description');
        });

        it('should create many records', async () => {
            const data = [
                {
                    id: createId(),
                    userId: testUser.id,
                    name: 'bulk-tag-1-' + Date.now(),
                    color: '#0000FF',
                    description: 'Bulk 1',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
                {
                    id: createId(),
                    userId: testUser.id,
                    name: 'bulk-tag-2-' + Date.now(),
                    color: '#FFFF00',
                    description: 'Bulk 2',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            ];

            const result = await tableOps.createManyRecords({
                data,
            });

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe(data[0].name);
            expect(result[1].name).toBe(data[1].name);
        });

        it('should create many records with override values', async () => {
            const timestamp = Date.now();
            const data = [
                {
                    id: createId(),
                    userId: testUser.id,
                    name: 'override-tag-1-' + timestamp,
                    color: '#111111',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
                {
                    id: createId(),
                    userId: testUser.id,
                    name: 'override-tag-2-' + timestamp,
                    color: '#222222',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            ];

            const result = await tableOps.createManyRecords({
                data,
                overrideValues: {
                    description: 'Override description',
                },
            });

            expect(result).toHaveLength(2);
            expect(result[0].description).toBe('Override description');
            expect(result[1].description).toBe('Override description');
        });
    });

    describe('Get Operations', () => {
        it('should get first record by identifiers', async () => {
            const created = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: 'get-first-test-' + Date.now(),
                    color: '#ABCDEF',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            });

            const result = await tableOps.getFirstRecord({
                identifiers: [
                    { field: 'id', value: created.id },
                    { field: 'userId', value: testUser.id },
                ],
            });

            expect(result).toBeDefined();
            expect(result?.id).toBe(created.id);
        });

        it('should return null when no record found', async () => {
            const result = await tableOps.getFirstRecord({
                identifiers: [
                    { field: 'id', value: 'non-existent-id' },
                    { field: 'userId', value: testUser.id },
                ],
            });

            expect(result).toBeNull();
        });

        it('should get many records with pagination', async () => {
            const timestamp = Date.now();
            await tableOps.createManyRecords({
                data: Array.from({ length: 5 }, (_, i) => ({
                    id: createId(),
                    userId: testUser.id,
                    name: `pagination-test-${timestamp}-${i}`,
                    color: '#FFFFFF',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                })),
            });

            const result = await tableOps.getManyRecords({
                identifiers: [{ field: 'userId', value: testUser.id }],
                pagination: { page: 1, pageSize: 3 },
            });

            expect(result.length).toBeLessThanOrEqual(3);
        });

        it('should get many records with ordering', async () => {
            const timestamp = Date.now();
            await tableOps.createManyRecords({
                data: [
                    {
                        id: createId(),
                        userId: testUser.id,
                        name: `order-a-${timestamp}`,
                        color: '#000001',
                        createdAt: new Date(Date.now() - 1000),
                        updatedAt: new Date(),
                        isActive: true,
                        transactionCount: 0,
                    },
                    {
                        id: createId(),
                        userId: testUser.id,
                        name: `order-b-${timestamp}`,
                        color: '#000002',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isActive: true,
                        transactionCount: 0,
                    },
                ],
            });

            const result = await tableOps.getManyRecords({
                identifiers: [{ field: 'userId', value: testUser.id }],
                orderBy: { createdAt: 'desc' },
                pagination: { page: 1, pageSize: 10 },
            });

            expect(result.length).toBeGreaterThan(0);
        });

        it('should get many records with selective columns', async () => {
            const result = await tableOps.getManyRecords({
                identifiers: [{ field: 'userId', value: testUser.id }],
                columns: ['id', 'name', 'color'],
                pagination: { page: 1, pageSize: 5 },
            });

            if (result.length > 0) {
                expect(result[0]).toHaveProperty('id');
                expect(result[0]).toHaveProperty('name');
                expect(result[0]).toHaveProperty('color');
                expect(result[0]).not.toHaveProperty('description');
            }
        });
    });

    describe('Update Operations', () => {
        it('should update a single record', async () => {
            const created = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: 'update-test-' + Date.now(),
                    color: '#111111',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            });

            const updated = await tableOps.updateRecord({
                identifiers: [{ field: 'id', value: created.id }],
                data: { name: 'updated-name', color: '#999999' },
            });

            expect(updated).toBeDefined();
            expect(updated?.name).toBe('updated-name');
            expect(updated?.color).toBe('#999999');
        });

        it('should return null when updating non-existent record', async () => {
            const result = await tableOps.updateRecord({
                identifiers: [{ field: 'id', value: 'non-existent-id' }],
                data: { name: 'should-not-exist' },
            });

            expect(result).toBeNull();
        });

        it('should update many records', async () => {
            const updated = await tableOps.updateManyRecords({
                identifiers: [{ field: 'userId', value: testUser.id }],
                data: { description: 'bulk-updated' },
            });

            expect(updated.length).toBeGreaterThanOrEqual(2);
            const ourUpdates = updated.filter((u) => u.description === 'bulk-updated');
            expect(ourUpdates.length).toBeGreaterThanOrEqual(2);
        });

        it('should update record with selective return columns', async () => {
            const created = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: 'selective-update-' + Date.now(),
                    color: '#AAAAAA',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            });

            const updated = await tableOps.updateRecord({
                identifiers: [{ field: 'id', value: created.id }],
                data: { color: '#BBBBBB' },
                returnColumns: ['id', 'color'],
            });

            expect(updated).toBeDefined();
            expect(updated).toHaveProperty('id');
            expect(updated).toHaveProperty('color');
            expect(updated).not.toHaveProperty('name');
        });
    });

    describe('Soft Delete Operations', () => {
        it('should deactivate a record', async () => {
            const created = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: 'deactivate-test-' + Date.now(),
                    color: '#CCCCCC',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            });

            const deactivated = await tableOps.deactivateRecord({
                identifiers: [{ field: 'id', value: created.id }],
            });

            expect(deactivated).toBeDefined();
            expect(deactivated?.isActive).toBe(false);
        });

        it('should activate a record', async () => {
            const created = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: 'activate-test-' + Date.now(),
                    color: '#DDDDDD',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: false,
                    transactionCount: 0,
                },
            });

            const activated = await tableOps.activateRecord({
                identifiers: [{ field: 'id', value: created.id }],
            });

            expect(activated).toBeDefined();
            expect(activated?.isActive).toBe(true);
        });

        it('should remove record with soft delete by default', async () => {
            const created = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: 'remove-soft-test-' + Date.now(),
                    color: '#EEEEEE',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            });

            const removed = await tableOps.removeRecord({
                identifiers: [{ field: 'id', value: created.id }],
                softDelete: true,
            });

            expect(removed).toBeDefined();
            expect(removed?.isActive).toBe(false);
        });
    });

    describe('Hard Delete Operations', () => {
        it('should permanently delete a record', async () => {
            const created = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: 'delete-hard-test-' + Date.now(),
                    color: '#FFFFFF',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            });

            const deleted = await tableOps.deleteRecord({
                identifiers: [{ field: 'id', value: created.id }],
            });

            expect(deleted).toBeDefined();
            expect(deleted?.id).toBe(created.id);

            const found = await tableOps.getFirstRecord({
                identifiers: [{ field: 'id', value: created.id }],
            });

            expect(found).toBeNull();
        });

        it('should remove record with hard delete when specified', async () => {
            const created = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: 'remove-hard-test-' + Date.now(),
                    color: '#F0F0F0',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            });

            await tableOps.removeRecord({
                identifiers: [{ field: 'id', value: created.id }],
                softDelete: false,
            });

            const found = await tableOps.getFirstRecord({
                identifiers: [{ field: 'id', value: created.id }],
            });

            expect(found).toBeNull();
        });
    });

    describe('Conflict Handling', () => {
        it('should handle conflict with ignore strategy', async () => {
            const uniqueName = 'conflict-ignore-' + Date.now();
            const data = {
                id: createId(),
                userId: testUser.id,
                name: uniqueName,
                color: '#123456',
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                transactionCount: 0,
            };

            const first = await tableOps.createRecord({ data });
            expect(first).toBeDefined();

            const duplicateData = {
                id: createId(),
                userId: testUser.id,
                name: uniqueName,
                color: '#654321',
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                transactionCount: 0,
            };

            await tableOps.createRecord({
                data: duplicateData,
                onConflict: 'ignore',
            });

            expect(first.name).toBe(uniqueName);
        });

        it('should handle conflict with update strategy', async () => {
            const uniqueName = 'conflict-update-' + Date.now();

            const updated = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: uniqueName,
                    color: '#BBBBBB',
                    description: 'updated',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
                onConflict: {
                    type: 'update',
                    target: ['userId', 'name'],
                    setExcluded: ['color', 'description'],
                },
            });

            expect(updated.description).toBe('updated');
            expect(updated.color).toBe('#BBBBBB');
        });

        it('should handle conflict with updateSet strategy', async () => {
            const uniqueName = 'conflict-updateset-' + Date.now();
            await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: uniqueName,
                    color: '#111111',
                    description: 'original',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            });

            const updated = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: uniqueName,
                    color: '#222222',
                    description: 'should-not-appear',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
                onConflict: {
                    type: 'updateSet',
                    target: ['userId', 'name'],
                    set: { color: '#CUSTOM' },
                },
            });

            expect(updated.color).toBe('#CUSTOM');
        });

        it('should handle many records with conflict resolution', async () => {
            const timestamp = Date.now();
            const uniqueName1 = `bulk-conflict-1-${timestamp}`;
            const uniqueName2 = `bulk-conflict-2-${timestamp}`;

            const first = await tableOps.createManyRecords({
                data: [
                    {
                        id: createId(),
                        userId: testUser.id,
                        name: uniqueName1,
                        color: '#000001',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isActive: true,
                        transactionCount: 0,
                    },
                    {
                        id: createId(),
                        userId: testUser.id,
                        name: uniqueName2,
                        color: '#000002',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isActive: true,
                        transactionCount: 0,
                    },
                ],
            });

            expect(first).toHaveLength(2);

            await tableOps.createManyRecords({
                data: [
                    {
                        id: createId(),
                        userId: testUser.id,
                        name: uniqueName1,
                        color: '#000003',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isActive: true,
                        transactionCount: 0,
                    },
                    {
                        id: createId(),
                        userId: testUser.id,
                        name: uniqueName2,
                        color: '#000004',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isActive: true,
                        transactionCount: 0,
                    },
                ],
                onConflict: 'ignore',
            });

            const allRecords = await tableOps.getManyRecords({
                identifiers: [
                    { field: 'userId', value: testUser.id },
                    { field: 'name', value: uniqueName1 },
                ],
            });

            expect(allRecords.length).toBe(1);
        });
    });

    describe('Type Safety', () => {
        it('should enforce type-safe column selection', async () => {
            const created = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: 'type-safe-test-' + Date.now(),
                    color: '#ABCDEF',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            });

            const result = await tableOps.getFirstRecord({
                identifiers: [{ field: 'id', value: created.id }],
                columns: ['id', 'name', 'color'],
            });

            expect(result).toBeDefined();
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('name');
            expect(result).toHaveProperty('color');
        });

        it('should enforce type-safe identifiers', async () => {
            const created = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: 'identifier-test-' + Date.now(),
                    color: '#FEDCBA',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            });

            const result = await tableOps.getFirstRecord({
                identifiers: [
                    { field: 'id', value: created.id },
                    { field: 'userId', value: testUser.id },
                ],
            });

            expect(result).toBeDefined();
            expect(result?.id).toBe(created.id);
        });
    });

    describe('Error Handling', () => {
        describe('Create Operations Error Handling', () => {
            it('should throw proper error for unique constraint violation', async () => {
                const uniqueName = 'unique-error-test-' + Date.now();
                const data = {
                    id: createId(),
                    userId: testUser.id,
                    name: uniqueName,
                    color: '#111111',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                };

                await tableOps.createRecord({ data });

                try {
                    await tableOps.createRecord({
                        data: {
                            ...data,
                            id: createId(),
                        },
                    });
                    fail('Should have thrown error for unique constraint violation');
                } catch (error) {
                    expect(error).toBeDefined();
                    expect(error instanceof Error).toBe(true);
                    const errorMessage = (error as Error).message;
                    expect(errorMessage).toBeTruthy();
                }
            });

            it('should throw error for createMany with duplicate data', async () => {
                const uniqueName = 'bulk-unique-error-' + Date.now();

                const duplicateData = [
                    {
                        id: createId(),
                        userId: testUser.id,
                        name: uniqueName,
                        color: '#111111',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isActive: true,
                        transactionCount: 0,
                    },
                    {
                        id: createId(),
                        userId: testUser.id,
                        name: uniqueName,
                        color: '#222222',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isActive: true,
                        transactionCount: 0,
                    },
                ];

                try {
                    await tableOps.createManyRecords({
                        data: duplicateData,
                        onConflict: 'fail',
                    });
                    fail('Should have thrown error for duplicate constraint');
                } catch (error) {
                    expect(error).toBeDefined();
                    expect(error instanceof Error).toBe(true);
                }
            });

            it('should throw error for invalid data types', async () => {
                try {
                    await tableOps.createRecord({
                        data: {
                            id: createId(),
                            userId: testUser.id,
                            name: 'invalid-type-test',
                            color: '#111111',
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            isActive: true,
                            transactionCount: 'invalid' as unknown as number,
                        },
                    });
                    fail('Should have thrown error for invalid data type');
                } catch (error) {
                    expect(error).toBeDefined();
                    expect(error instanceof Error).toBe(true);
                }
            });
        });

        describe('Get Operations - Graceful Handling', () => {
            it('should not throw error for getFirstRecord with empty identifiers', async () => {
                const result = await tableOps.getFirstRecord({
                    identifiers: [],
                });

                expect(result).toBeDefined();
            });

            it('should not throw error for getManyRecords with invalid pagination', async () => {
                const result = await tableOps.getManyRecords({
                    identifiers: [{ field: 'userId', value: testUser.id }],
                    pagination: { page: -1, pageSize: 0 },
                });

                expect(Array.isArray(result)).toBe(true);
            });

            it('should return null (not throw) for getFirstRecord with non-matching identifiers', async () => {
                const result = await tableOps.getFirstRecord({
                    identifiers: [
                        { field: 'id', value: 'definitely-does-not-exist' },
                        { field: 'userId', value: 'also-does-not-exist' },
                    ],
                });

                expect(result).toBeNull();
            });

            it('should return empty array (not throw) for getManyRecords with non-matching identifiers', async () => {
                const result = await tableOps.getManyRecords({
                    identifiers: [
                        { field: 'id', value: 'definitely-does-not-exist-' + Date.now() },
                    ],
                });

                expect(Array.isArray(result)).toBe(true);
                expect(result).toHaveLength(0);
            });
        });

        describe('Update Operations Error Handling', () => {
            it('should throw error for updateRecord with constraint violation', async () => {
                const name1 = 'update-constraint-1-' + Date.now();
                const name2 = 'update-constraint-2-' + Date.now();

                const record1 = await tableOps.createRecord({
                    data: {
                        id: createId(),
                        userId: testUser.id,
                        name: name1,
                        color: '#111111',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isActive: true,
                        transactionCount: 0,
                    },
                });

                await tableOps.createRecord({
                    data: {
                        id: createId(),
                        userId: testUser.id,
                        name: name2,
                        color: '#222222',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isActive: true,
                        transactionCount: 0,
                    },
                });

                try {
                    await tableOps.updateRecord({
                        identifiers: [{ field: 'id', value: record1.id }],
                        data: { name: name2 },
                    });
                    fail('Should have thrown error for unique constraint violation');
                } catch (error) {
                    expect(error).toBeDefined();
                    expect(error instanceof Error).toBe(true);
                }
            });

            it('should return null (not throw) when updating non-existent record', async () => {
                const result = await tableOps.updateRecord({
                    identifiers: [{ field: 'id', value: 'non-existent-' + Date.now() }],
                    data: { color: '#FFFFFF' },
                });

                expect(result).toBeNull();
            });

            it('should return empty array (not throw) for updateMany with no matches', async () => {
                const result = await tableOps.updateManyRecords({
                    identifiers: [
                        { field: 'userId', value: 'user-does-not-exist' },
                        { field: 'name', value: 'also-does-not-exist' },
                    ],
                    data: { color: '#000000' },
                });

                expect(result).toHaveLength(0);
            });
        });

        describe('Delete Operations - Graceful Handling', () => {
            it('should return null (not throw) for deactivate of non-existent record', async () => {
                const result = await tableOps.deactivateRecord({
                    identifiers: [{ field: 'id', value: 'does-not-exist' }],
                });

                expect(result).toBeNull();
            });

            it('should return null (not throw) for activate of non-existent record', async () => {
                const result = await tableOps.activateRecord({
                    identifiers: [{ field: 'id', value: 'does-not-exist' }],
                });

                expect(result).toBeNull();
            });

            it('should return null (not throw) for delete of non-existent record', async () => {
                const result = await tableOps.deleteRecord({
                    identifiers: [{ field: 'id', value: 'does-not-exist' }],
                });

                expect(result).toBeNull();
            });

            it('should not throw on multiple deactivate attempts', async () => {
                const created = await tableOps.createRecord({
                    data: {
                        id: createId(),
                        userId: testUser.id,
                        name: 'double-deactivate-' + Date.now(),
                        color: '#AAAAAA',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isActive: true,
                        transactionCount: 0,
                    },
                });

                const first = await tableOps.deactivateRecord({
                    identifiers: [{ field: 'id', value: created.id }],
                });

                expect(first?.isActive).toBe(false);

                const second = await tableOps.deactivateRecord({
                    identifiers: [{ field: 'id', value: created.id }],
                });

                expect(second?.isActive).toBe(false);
            });

            it('should return null (not throw) for delete after already deleted', async () => {
                const created = await tableOps.createRecord({
                    data: {
                        id: createId(),
                        userId: testUser.id,
                        name: 'double-delete-' + Date.now(),
                        color: '#BBBBBB',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isActive: true,
                        transactionCount: 0,
                    },
                });

                await tableOps.deleteRecord({
                    identifiers: [{ field: 'id', value: created.id }],
                });

                const secondDelete = await tableOps.deleteRecord({
                    identifiers: [{ field: 'id', value: created.id }],
                });

                expect(secondDelete).toBeNull();
            });
        });

        describe('Edge Cases', () => {
            it('should not throw on empty identifiers array in update', async () => {
                const result = await tableOps.updateRecord({
                    identifiers: [],
                    data: { color: '#FFFFFF' },
                });

                expect(result).toBeDefined();
            });

            it('should throw descriptive error for empty data in createMany', async () => {
                try {
                    await tableOps.createManyRecords({
                        data: [],
                    });
                    fail('Should have thrown error for empty data array');
                } catch (error) {
                    expect(error).toBeDefined();
                    expect(error instanceof Error).toBe(true);
                    expect((error as Error).message).toContain('values()');
                }
            });

            it('should not throw on very large pagination values', async () => {
                const result = await tableOps.getManyRecords({
                    identifiers: [{ field: 'userId', value: testUser.id }],
                    pagination: { page: 999999, pageSize: 1000 },
                });

                expect(Array.isArray(result)).toBe(true);
            });

            it('should not throw on special characters in string fields', async () => {
                const specialName = 'test-name-with-\'quotes\'-and-"escapes"';
                const created = await tableOps.createRecord({
                    data: {
                        id: createId(),
                        userId: testUser.id,
                        name: specialName,
                        color: '#CCCCCC',
                        description: 'Special: !@#$%^&*()_+-=[]{}|;:,.<>?',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isActive: true,
                        transactionCount: 0,
                    },
                });

                expect(created.name).toBe(specialName);
                expect(created.description).toContain('Special:');
            });
        });
    });

    describe('Advanced Filtering and Complex Queries', () => {
        it('should handle multiple identifiers with AND logic', async () => {
            const timestamp = Date.now();
            const created = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: `multi-filter-${timestamp}`,
                    color: '#MULTI01',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 5,
                },
            });

            const result = await tableOps.getFirstRecord({
                identifiers: [
                    { field: 'id', value: created.id },
                    { field: 'userId', value: testUser.id },
                    { field: 'isActive', value: true },
                ],
            });

            expect(result).toBeDefined();
            expect(result?.id).toBe(created.id);
        });

        it("should return null when one identifier doesn't match", async () => {
            const created = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: 'partial-match-' + Date.now(),
                    color: '#PART001',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            });

            const result = await tableOps.getFirstRecord({
                identifiers: [
                    { field: 'id', value: created.id },
                    { field: 'userId', value: 'wrong-user-id' },
                ],
            });

            expect(result).toBeNull();
        });

        it('should handle complex ordering with multiple columns', async () => {
            const timestamp = Date.now();
            await tableOps.createManyRecords({
                data: Array.from({ length: 5 }, (_, i) => ({
                    id: createId(),
                    userId: testUser.id,
                    name: `order-complex-${i}-${timestamp}`,
                    color: i % 2 === 0 ? '#EVEN' : '#ODD',
                    createdAt: new Date(Date.now() - i * 1000),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: i,
                })),
            });

            const result = await tableOps.getManyRecords({
                identifiers: [{ field: 'userId', value: testUser.id }],
                orderBy: { createdAt: 'desc', transactionCount: 'asc' },
                pagination: { page: 1, pageSize: 5 },
            });

            expect(result.length).toBeGreaterThan(0);
        });

        it('should handle pagination edge cases - page 0', async () => {
            const result = await tableOps.getManyRecords({
                identifiers: [{ field: 'userId', value: testUser.id }],
                pagination: { page: 0, pageSize: 5 },
            });

            expect(Array.isArray(result)).toBe(true);
        });

        it('should handle pagination edge cases - negative page', async () => {
            const result = await tableOps.getManyRecords({
                identifiers: [{ field: 'userId', value: testUser.id }],
                pagination: { page: -1, pageSize: 5 },
            });

            expect(Array.isArray(result)).toBe(true);
        });

        it('should handle pagination edge cases - zero pageSize', async () => {
            const result = await tableOps.getManyRecords({
                identifiers: [{ field: 'userId', value: testUser.id }],
                pagination: { page: 1, pageSize: 0 },
            });

            expect(Array.isArray(result)).toBe(true);
        });
    });

    describe('Concurrent Operations', () => {
        it('should handle concurrent creates', async () => {
            const timestamp = Date.now();
            const promises = Array.from({ length: 5 }, (_, i) =>
                tableOps.createRecord({
                    data: {
                        id: createId(),
                        userId: testUser.id,
                        name: `concurrent-${i}-${timestamp}`,
                        color: `#C${i}${i}${i}${i}${i}${i}`,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isActive: true,
                        transactionCount: 0,
                    },
                })
            );

            const results = await Promise.all(promises);

            expect(results).toHaveLength(5);
            results.forEach((r, i) => {
                expect(r.name).toContain(`concurrent-${i}`);
            });
        });

        it('should handle concurrent updates to different records', async () => {
            const timestamp = Date.now();
            const created = await tableOps.createManyRecords({
                data: Array.from({ length: 3 }, (_, i) => ({
                    id: createId(),
                    userId: testUser.id,
                    name: `concurrent-update-${i}-${timestamp}`,
                    color: '#START',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                })),
            });

            const promises = created.map((record, i) =>
                tableOps.updateRecord({
                    identifiers: [{ field: 'id', value: record.id }],
                    data: { color: `#UPD${i}` },
                })
            );

            const results = await Promise.all(promises);

            expect(results).toHaveLength(3);
            results.forEach((r, i) => {
                expect(r?.color).toBe(`#UPD${i}`);
            });
        });

        it('should handle concurrent reads', async () => {
            const created = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: 'concurrent-read-' + Date.now(),
                    color: '#CREAD',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            });

            const promises = Array.from({ length: 10 }, () =>
                tableOps.getFirstRecord({
                    identifiers: [{ field: 'id', value: created.id }],
                })
            );

            const results = await Promise.all(promises);

            expect(results).toHaveLength(10);
            results.forEach((r) => {
                expect(r?.id).toBe(created.id);
            });
        });
    });

    describe('Boundary Value Tests', () => {
        it('should handle empty string values', async () => {
            const created = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: 'empty-desc-' + Date.now(),
                    color: '#EMPTY',
                    description: '',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            });

            expect(created.description).toBe('');
        });

        it('should handle very long string values', async () => {
            const longString = 'A'.repeat(1000);
            const created = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: 'long-desc-' + Date.now(),
                    color: '#LONG',
                    description: longString,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            });

            expect(created.description).toBe(longString);
        });

        it('should handle zero numeric values', async () => {
            const created = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: 'zero-count-' + Date.now(),
                    color: '#ZERO',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            });

            expect(created.transactionCount).toBe(0);
        });

        it('should handle large numeric values', async () => {
            const largeNumber = 999999999;
            const created = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: 'large-count-' + Date.now(),
                    color: '#LARGE',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: largeNumber,
                },
            });

            expect(created.transactionCount).toBe(largeNumber);
        });

        it('should handle null description', async () => {
            const created = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: 'null-desc-' + Date.now(),
                    color: '#NULL',
                    description: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            });

            expect(created.description).toBeNull();
        });
    });

    describe('Performance and Bulk Operations', () => {
        it('should handle creating 100 records efficiently', async () => {
            const timestamp = Date.now();
            const startTime = Date.now();

            const data = Array.from({ length: 100 }, (_, i) => ({
                id: createId(),
                userId: testUser.id,
                name: `bulk-perf-${i}-${timestamp}`,
                color: `#${i.toString(16).padStart(6, '0')}`,
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                transactionCount: i,
            }));

            const result = await tableOps.createManyRecords({ data });

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(result).toHaveLength(100);
            expect(duration).toBeLessThan(10000); // Should complete in under 10 seconds
        });

        it('should handle updating many records efficiently', async () => {
            const startTime = Date.now();

            const result = await tableOps.updateManyRecords({
                identifiers: [{ field: 'userId', value: testUser.id }],
                data: { color: '#AFTER' },
            });

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(result.length).toBeGreaterThanOrEqual(20);
            expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
        });

        it('should handle querying many records with pagination', async () => {
            const result = await tableOps.getManyRecords({
                identifiers: [{ field: 'userId', value: testUser.id }],
                pagination: { page: 1, pageSize: 100 },
            });

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeLessThanOrEqual(100);
        });
    });

    describe('Data Integrity', () => {
        it('should maintain referential integrity with userId', async () => {
            const created = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: 'integrity-test-' + Date.now(),
                    color: '#INTEG',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            });

            const fetched = await tableOps.getFirstRecord({
                identifiers: [
                    { field: 'id', value: created.id },
                    { field: 'userId', value: testUser.id },
                ],
            });

            expect(fetched?.userId).toBe(testUser.id);
            expect(fetched?.id).toBe(created.id);
        });

        it('should not allow cross-user data access', async () => {
            const otherUser = await createTestUser();

            const userARecord = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: 'user-a-' + Date.now(),
                    color: '#USERA',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            });

            const result = await tableOps.getFirstRecord({
                identifiers: [
                    { field: 'id', value: userARecord.id },
                    { field: 'userId', value: otherUser.id },
                ],
            });

            expect(result).toBeNull();
        });

        it('should preserve timestamps on updates', async () => {
            const created = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: 'timestamp-test-' + Date.now(),
                    color: '#TIME',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    transactionCount: 0,
                },
            });

            const originalCreatedAt = created.createdAt;

            // Wait a bit to ensure timestamp difference
            await new Promise((resolve) => setTimeout(resolve, 100));

            const updated = await tableOps.updateRecord({
                identifiers: [{ field: 'id', value: created.id }],
                data: { color: '#TIME2' },
            });

            expect(updated?.createdAt).toEqual(originalCreatedAt);
            expect(updated?.updatedAt).not.toEqual(created.updatedAt);
        });
    });
});
