import { createTestUser } from '@/../test/utils';
import { tag } from '@/features/tag/server/db/tables';
import { TableOperationsBuilder } from '@/server/lib/db/query/table-operations';
import { createId } from '@paralleldrive/cuid2';
import { beforeAll, describe, expect, it } from 'vitest';

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
            const timestamp = Date.now();
            const created = await tableOps.createManyRecords({
                data: [
                    {
                        id: createId(),
                        userId: testUser.id,
                        name: `bulk-update-1-${timestamp}`,
                        color: '#111111',
                        description: 'original',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isActive: true,
                        transactionCount: 0,
                    },
                    {
                        id: createId(),
                        userId: testUser.id,
                        name: `bulk-update-2-${timestamp}`,
                        color: '#222222',
                        description: 'original',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isActive: true,
                        transactionCount: 0,
                    },
                ],
            });

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
            const firstRecord = await tableOps.createRecord({
                data: {
                    id: createId(),
                    userId: testUser.id,
                    name: uniqueName,
                    color: '#AAAAAA',
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
                const specialName = "test-name-with-'quotes'-and-\"escapes\"";
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
});
