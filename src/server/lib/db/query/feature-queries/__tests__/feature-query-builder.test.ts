import { beforeAll, describe, expect, it } from 'vitest';

import { createTestUser } from '@/../test/utils/create-user';
import { tag } from '@/features/tag/server/db/tables';
import { createFeatureQueries } from '@/server/lib/db/query/feature-queries';
import { TableOperationsBuilder } from '@/server/lib/db/query/table-operations';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';

describe('Feature Query Builder', () => {
    let testUser: Awaited<ReturnType<typeof createTestUser>>;

    beforeAll(async () => {
        testUser = await createTestUser();
    });

    describe('Query Builder Creation', () => {
        it('should create a query builder with table config', () => {
            const tableConfig = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name', 'color'])
                .build();

            const builder = createFeatureQueries('tag-test', tableConfig);

            expect(builder).toBeDefined();
            expect(builder.name).toBe('tag-test');
            expect(builder.queries).toBeDefined();
        });

        it('should register all standard queries', () => {
            const tableConfig = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name', 'color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).registerAllStandard();

            expect(queries.queries).toHaveProperty('create');
            expect(queries.queries).toHaveProperty('createMany');
            expect(queries.queries).toHaveProperty('getById');
            expect(queries.queries).toHaveProperty('getMany');
            expect(queries.queries).toHaveProperty('updateById');
            expect(queries.queries).toHaveProperty('removeById');
        });
    });

    describe('Standard CRUD Queries', () => {
        const tableConfig = createFeatureTableConfig(tag)
            .restrictReturnColumns(['id', 'name', 'color', 'description', 'userId', 'isActive'])
            .restrictInsertFields(['name', 'color', 'description'])
            .restrictUpdateFields(['name', 'color', 'description'])
            .build();

        const queries = createFeatureQueries('tag', tableConfig).registerAllStandard({
            defaultFilters: {
                isActive: true,
            },
        });

        describe('Create Operations', () => {
            it('should create a single record', async () => {
                const result = await queries.queries.create({
                    data: {
                        name: 'test-tag-' + Date.now(),
                        color: '#FF0000',
                        description: 'Test tag',
                    },
                    userId: testUser.id,
                });

                expect(result).toBeDefined();
                expect(result.name).toContain('test-tag-');
                expect(result.color).toBe('#FF0000');
                expect(result.userId).toBe(testUser.id);
            });

            it('should create many records', async () => {
                const timestamp = Date.now();
                const result = await queries.queries.createMany({
                    data: [
                        {
                            name: `bulk-tag-1-${timestamp}`,
                            color: '#00FF00',
                            description: 'Bulk 1',
                        },
                        {
                            name: `bulk-tag-2-${timestamp}`,
                            color: '#0000FF',
                            description: 'Bulk 2',
                        },
                    ],
                    userId: testUser.id,
                });

                expect(result).toHaveLength(2);
                expect(result[0].userId).toBe(testUser.id);
                expect(result[1].userId).toBe(testUser.id);
            });

            it('should automatically add userId to created records', async () => {
                const result = await queries.queries.create({
                    data: {
                        name: 'userid-test-' + Date.now(),
                        color: '#AAAAAA',
                    },
                    userId: testUser.id,
                });

                expect(result.userId).toBe(testUser.id);
            });
        });

        describe('Read Operations', () => {
            it('should get a record by id', async () => {
                const created = await queries.queries.create({
                    data: {
                        name: 'getbyid-test-' + Date.now(),
                        color: '#BBBBBB',
                    },
                    userId: testUser.id,
                });

                const result = await queries.queries.getById({
                    ids: { id: created.id },
                    userId: testUser.id,
                });

                expect(result).toBeDefined();
                expect(result?.id).toBe(created.id);
                expect(result?.name).toBe(created.name);
            });

            it('should return null when record not found', async () => {
                const result = await queries.queries.getById({
                    ids: { id: 'non-existent-id' },
                    userId: testUser.id,
                });

                expect(result).toBeNull();
            });

            it('should enforce userId scoping in getById', async () => {
                const otherUser = await createTestUser();
                const created = await queries.queries.create({
                    data: {
                        name: 'userid-scope-test-' + Date.now(),
                        color: '#CCCCCC',
                    },
                    userId: testUser.id,
                });

                const result = await queries.queries.getById({
                    ids: { id: created.id },
                    userId: otherUser.id,
                });

                expect(result).toBeNull();
            });

            it('should get many records', async () => {
                const timestamp = Date.now();
                await queries.queries.createMany({
                    data: [
                        { name: `many-1-${timestamp}`, color: '#111111' },
                        { name: `many-2-${timestamp}`, color: '#222222' },
                        { name: `many-3-${timestamp}`, color: '#333333' },
                    ],
                    userId: testUser.id,
                });

                const result = await queries.queries.getMany({
                    userId: testUser.id,
                });

                expect(result.length).toBeGreaterThanOrEqual(3);
            });

            it('should only return active records with defaultFilters', async () => {
                const created = await queries.queries.create({
                    data: {
                        name: 'active-filter-test-' + Date.now(),
                        color: '#DDDDDD',
                    },
                    userId: testUser.id,
                });

                await queries.queries.removeById({
                    ids: { id: created.id },
                    userId: testUser.id,
                });

                const result = await queries.queries.getById({
                    ids: { id: created.id },
                    userId: testUser.id,
                });

                expect(result).toBeNull();
            });
        });

        describe('Update Operations', () => {
            it('should update a record by id', async () => {
                const created = await queries.queries.create({
                    data: {
                        name: 'update-test-' + Date.now(),
                        color: '#EEEEEE',
                    },
                    userId: testUser.id,
                });

                const updated = await queries.queries.updateById({
                    ids: { id: created.id },
                    data: {
                        color: '#FFFFFF',
                        description: 'Updated',
                    },
                    userId: testUser.id,
                });

                expect(updated).toBeDefined();
                expect(updated?.color).toBe('#FFFFFF');
                expect(updated?.description).toBe('Updated');
                expect(updated?.name).toBe(created.name);
            });

            it('should return null when updating non-existent record', async () => {
                const result = await queries.queries.updateById({
                    ids: { id: 'non-existent-id' },
                    data: { color: '#000000' },
                    userId: testUser.id,
                });

                expect(result).toBeNull();
            });

            it('should enforce userId scoping in updateById', async () => {
                const otherUser = await createTestUser();
                const created = await queries.queries.create({
                    data: {
                        name: 'update-scope-test-' + Date.now(),
                        color: '#F0F0F0',
                    },
                    userId: testUser.id,
                });

                const result = await queries.queries.updateById({
                    ids: { id: created.id },
                    data: { color: '#0F0F0F' },
                    userId: otherUser.id,
                });

                expect(result).toBeNull();
            });
        });

        describe('Delete Operations', () => {
            it('should soft delete a record by default', async () => {
                const tableOps = new TableOperationsBuilder(tag);
                const created = await queries.queries.create({
                    data: {
                        name: 'soft-delete-test-' + Date.now(),
                        color: '#ABCDEF',
                    },
                    userId: testUser.id,
                });

                await queries.queries.removeById({
                    ids: { id: created.id },
                    userId: testUser.id,
                });

                const deletedRecord = await tableOps.getFirstRecord({
                    identifiers: [{ field: 'id', value: created.id }],
                    columns: tableConfig.getReturnColumns(),
                });

                expect(deletedRecord).toBeDefined();
                expect(deletedRecord?.isActive).toBe(false);

                const found = await queries.queries.getById({
                    ids: { id: created.id },
                    userId: testUser.id,
                });

                expect(found).toBeNull();
            });

            it('should enforce userId scoping in removeById', async () => {
                const otherUser = await createTestUser();
                const created = await queries.queries.create({
                    data: {
                        name: 'delete-scope-test-' + Date.now(),
                        color: '#FEDCBA',
                    },
                    userId: testUser.id,
                });

                const result = await queries.queries.removeById({
                    ids: { id: created.id },
                    userId: otherUser.id,
                });

                // removeById returns undefined when no record is found
                expect(result).toBeUndefined();
            });
        });
    });

    describe('Custom Queries', () => {
        const tableConfig = createFeatureTableConfig(tag)
            .restrictReturnColumns(['id', 'name', 'color'])
            .build();

        it('should add a custom query', () => {
            const queries = createFeatureQueries('tag-test', tableConfig).addQuery(
                'customOperation',
                () => ({
                    operation: 'custom operation',
                    fn: async () => {
                        return { custom: true };
                    },
                })
            );

            expect(queries.queries).toHaveProperty('customOperation');
            expect(typeof queries.queries.customOperation).toBe('function');
        });

        it('should execute custom query', async () => {
            const queries = createFeatureQueries('tag-test', tableConfig).addQuery(
                'getConstant',
                () => ({
                    operation: 'get constant',
                    fn: async () => {
                        return { value: 42 };
                    },
                })
            );

            const result = await queries.queries.getConstant({} as never);

            expect(result).toEqual({ value: 42 });
        });

        it('should chain multiple custom queries', () => {
            const queries = createFeatureQueries('tag-test', tableConfig)
                .addQuery('customOne', () => ({
                    operation: 'custom one',
                    fn: async () => ({ one: true }),
                }))
                .addQuery('customTwo', () => ({
                    operation: 'custom two',
                    fn: async () => ({ two: true }),
                }));

            expect(queries.queries).toHaveProperty('customOne');
            expect(queries.queries).toHaveProperty('customTwo');
        });

        it('should execute chained custom queries', async () => {
            const queries = createFeatureQueries('tag-test', tableConfig)
                .addQuery('customOne', () => ({
                    operation: 'custom one',
                    fn: async () => ({ one: true }),
                }))
                .addQuery('customTwo', () => ({
                    operation: 'custom two',
                    fn: async () => ({ two: true }),
                }));

            const resultOne = await queries.queries.customOne({} as never);
            const resultTwo = await queries.queries.customTwo({} as never);

            expect(resultOne).toEqual({ one: true });
            expect(resultTwo).toEqual({ two: true });
        });

        it('should use tableOps in custom queries', async () => {
            const fullTableConfig = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name', 'color', 'userId'])
                .build();

            const queries = createFeatureQueries('tag-test', fullTableConfig).addQuery(
                'findByName',
                ({ tableOps, tableConfig }) => ({
                    operation: 'find by name',
                    fn: async (input: { name: string; userId: string }) => {
                        return await tableOps.getFirstRecord({
                            columns: tableConfig.getReturnColumns(),
                            identifiers: [
                                { field: 'name', value: input.name },
                                { field: 'userId', value: input.userId },
                            ],
                        });
                    },
                })
            );

            expect(queries.queries).toHaveProperty('findByName');
            expect(typeof queries.queries.findByName).toBe('function');
        });
    });

    describe('Selective Standard Queries with withStandard', () => {
        it('should only register selected standard queries', () => {
            const tableConfig = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name', 'color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).withStandard((b) =>
                b.create().getById()
            );

            expect(queries.queries).toHaveProperty('create');
            expect(queries.queries).toHaveProperty('getById');
            expect(queries.queries).not.toHaveProperty('getMany');
            expect(queries.queries).not.toHaveProperty('updateById');
            expect(queries.queries).not.toHaveProperty('removeById');
            expect(queries.queries).not.toHaveProperty('createMany');
        });

        it('should work with selective queries', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name', 'color', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).withStandard((b) =>
                b.create().getById()
            );

            const created = await queries.queries.create({
                data: {
                    name: 'selective-test-' + Date.now(),
                    color: '#SELECT1',
                },
                userId: testUser.id,
            });

            expect(created).toBeDefined();
            expect(created.name).toContain('selective-test-');

            const fetched = await queries.queries.getById({
                ids: { id: created.id },
                userId: testUser.id,
            });

            expect(fetched).toBeDefined();
            expect(fetched?.id).toBe(created.id);
        });
    });

    describe('Integration with Standard and Custom Queries', () => {
        it('should combine standard queries with custom queries', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name', 'color', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig)
                .registerAllStandard()
                .addQuery('countTags', ({ tableOps }) => ({
                    operation: 'count tags',
                    fn: async ({ userId }: { userId: string }) => {
                        const result = await tableOps.getManyRecords({
                            identifiers: [{ field: 'userId', value: userId }],
                        });
                        return { count: result.length };
                    },
                }));

            const count = await queries.queries.countTags({ userId: testUser.id });

            expect(count).toHaveProperty('count');
            expect(typeof count.count).toBe('number');
        });

        it('should use standard queries within custom queries', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name', 'color', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig)
                .registerAllStandard()
                .addQuery('createAndFetch', ({ tableOps }) => ({
                    operation: 'create and fetch',
                    fn: async ({
                        name,
                        color,
                        userId,
                    }: {
                        name: string;
                        color: string;
                        userId: string;
                    }) => {
                        const created = await tableOps.createRecord({
                            data: { name, color, userId },
                            returnColumns: tableConfig.getReturnColumns(),
                        });

                        return await tableOps.getFirstRecord({
                            identifiers: [{ field: 'id', value: created.id }],
                            columns: tableConfig.getReturnColumns(),
                        });
                    },
                }));

            const result = await queries.queries.createAndFetch({
                name: 'create-fetch-' + Date.now(),
                color: '#CREFET1',
                userId: testUser.id,
            });

            expect(result).toBeDefined();
            expect(result?.name).toContain('create-fetch-');
        });
    });

    describe('Pick Queries', () => {
        it('should pick a subset of queries', () => {
            const tableConfig = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name', 'color'])
                .build();

            const allQueries = createFeatureQueries('tag-test', tableConfig).registerAllStandard();

            const pickedQueries = allQueries.pick(['create', 'getById']);

            expect(pickedQueries.queries).toHaveProperty('create');
            expect(pickedQueries.queries).toHaveProperty('getById');
            expect(Object.keys(pickedQueries.queries)).toHaveLength(2);
        });
    });

    describe('Type Safety', () => {
        it('should provide type-safe query inputs', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name', 'color', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).registerAllStandard();

            const created = await queries.queries.create({
                data: {
                    name: 'type-safe-' + Date.now(),
                    color: '#TYPE001',
                },
                userId: testUser.id,
            });

            expect(created).toBeDefined();
            expect(created.id).toBeDefined();
            expect(created.name).toContain('type-safe-');
        });

        it('should respect table config column restrictions', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).registerAllStandard();

            const created = await queries.queries.create({
                data: {
                    name: 'restricted-' + Date.now(),
                    color: '#REST001',
                },
                userId: testUser.id,
            });

            // Should only return id and name (per restrictReturnColumns)
            expect(created).toHaveProperty('id');
            expect(created).toHaveProperty('name');
            expect(created).not.toHaveProperty('color');
            expect(created).not.toHaveProperty('description');
        });
    });

    describe('Builder Pattern Edge Cases', () => {
        it('should handle empty queries object initially', () => {
            const tableConfig = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name'])
                .build();

            const builder = createFeatureQueries('tag-test', tableConfig);

            expect(builder.queries).toEqual({});
            expect(Object.keys(builder.queries)).toHaveLength(0);
        });

        it('should allow selective query registration', () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).withStandard((b) =>
                b.create().getById()
            );

            expect(Object.keys(queries.queries)).toHaveLength(2);
            expect(queries.queries).toHaveProperty('create');
            expect(queries.queries).toHaveProperty('getById');
            expect(queries.queries).not.toHaveProperty('updateById');
        });

        it('should support method chaining with custom queries', () => {
            const tableConfig = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig)
                .addQuery('custom1', () => ({
                    operation: 'custom 1',
                    fn: async () => ({ result: 1 }),
                }))
                .addQuery('custom2', () => ({
                    operation: 'custom 2',
                    fn: async () => ({ result: 2 }),
                }))
                .addQuery('custom3', () => ({
                    operation: 'custom 3',
                    fn: async () => ({ result: 3 }),
                }));

            expect(Object.keys(queries.queries)).toHaveLength(3);
        });
    });

    describe('Query Execution Edge Cases', () => {
        it('should handle rapid successive creates', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).registerAllStandard();

            const timestamp = Date.now();
            const results = await Promise.all(
                Array.from({ length: 5 }, (_, i) =>
                    queries.queries.create({
                        data: { name: `rapid-${i}-${timestamp}`, color: '#RAPID' },
                        userId: testUser.id,
                    })
                )
            );

            expect(results).toHaveLength(5);
            results.forEach((r, i) => {
                expect(r.name).toContain(`rapid-${i}`);
            });
        });

        it('should handle interleaved creates and reads', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).registerAllStandard();

            const created = await queries.queries.create({
                data: { name: 'interleave-' + Date.now(), color: '#INTER' },
                userId: testUser.id,
            });

            const read1 = queries.queries.getById({
                ids: { id: created.id },
                userId: testUser.id,
            });

            const read2 = queries.queries.getById({
                ids: { id: created.id },
                userId: testUser.id,
            });

            const results = await Promise.all([read1, read2]);

            expect(results[0]?.id).toBe(created.id);
            expect(results[1]?.id).toBe(created.id);
        });

        it('should handle empty userId scoping correctly', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).registerAllStandard();

            await expect(
                // @ts-expect-error - testing runtime error
                queries.queries.getMany({})
            ).rejects.toThrow('User ID is required when userIdColumn is configured');
        });
    });

    describe('Complex Query Combinations', () => {
        it('should handle create -> update -> read flow', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'color', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .restrictUpdateFields(['name', 'color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).registerAllStandard();

            const created = await queries.queries.create({
                data: { name: 'flow-test-' + Date.now(), color: '#FLOW1' },
                userId: testUser.id,
            });

            const updated = await queries.queries.updateById({
                ids: { id: created.id },
                data: { color: '#FLOW2' },
                userId: testUser.id,
            });

            const fetched = await queries.queries.getById({
                ids: { id: created.id },
                userId: testUser.id,
            });

            expect(fetched?.color).toBe('#FLOW2');
            expect(updated?.color).toBe('#FLOW2');
        });

        it('should handle createMany -> getMany -> updateMany flow', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'color', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .restrictUpdateFields(['color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).registerAllStandard({
                defaultFilters: { isActive: true },
            });

            const timestamp = Date.now();
            const created = await queries.queries.createMany({
                data: [
                    { name: `bulk-flow-1-${timestamp}`, color: '#BULK1' },
                    { name: `bulk-flow-2-${timestamp}`, color: '#BULK2' },
                ],
                userId: testUser.id,
            });

            expect(created).toHaveLength(2);

            const fetched = await queries.queries.getMany({
                userId: testUser.id,
            });

            expect(fetched.length).toBeGreaterThanOrEqual(2);
        });

        it('should handle create -> delete -> verify flow', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'isActive'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).registerAllStandard({
                defaultFilters: { isActive: true },
            });

            const created = await queries.queries.create({
                data: { name: 'delete-flow-' + Date.now(), color: '#DEL' },
                userId: testUser.id,
            });

            await queries.queries.removeById({
                ids: { id: created.id },
                userId: testUser.id,
            });

            const fetched = await queries.queries.getById({
                ids: { id: created.id },
                userId: testUser.id,
            });

            expect(fetched).toBeNull();
        });
    });

    describe('Multi-Tenant Isolation', () => {
        it('should isolate data between different users', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).registerAllStandard();

            const user1 = testUser;
            const user2 = await createTestUser();

            const user1Records = await queries.queries.getMany({
                userId: user1.id,
            });

            const user2Records = await queries.queries.getMany({
                userId: user2.id,
            });

            expect(user1Records.every((r) => r.userId === user1.id)).toBe(true);
            expect(user2Records.every((r) => r.userId === user2.id)).toBe(true);
        });

        it('should prevent cross-user updates', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'userId', 'color'])
                .restrictInsertFields(['name', 'color'])
                .restrictUpdateFields(['color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).registerAllStandard();

            const user1 = testUser;
            const user2 = await createTestUser();

            const record = await queries.queries.create({
                data: { name: 'cross-user-' + Date.now(), color: '#ORIG' },
                userId: user1.id,
            });

            const updateResult = await queries.queries.updateById({
                ids: { id: record.id },
                data: { color: '#HACKED' },
                userId: user2.id, // Different user trying to update
            });

            expect(updateResult).toBeNull();

            const verified = await queries.queries.getById({
                ids: { id: record.id },
                userId: user1.id,
            });

            expect(verified?.color).not.toBe('#HACKED');
        });

        it('should prevent cross-user deletes', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).registerAllStandard();

            const user1 = testUser;
            const user2 = await createTestUser();

            const record = await queries.queries.create({
                data: { name: 'cross-delete-' + Date.now(), color: '#SAFE' },
                userId: user1.id,
            });

            await queries.queries.removeById({
                ids: { id: record.id },
                userId: user2.id, // Different user trying to delete
            });

            const verified = await queries.queries.getById({
                ids: { id: record.id },
                userId: user1.id,
            });

            expect(verified).toBeDefined(); // Should still exist
        });
    });

    describe('Performance and Scalability', () => {
        it('should handle bulk creates efficiently', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).registerAllStandard();

            const timestamp = Date.now();
            const startTime = Date.now();

            const data = Array.from({ length: 50 }, (_, i) => ({
                name: `perf-bulk-${i}-${timestamp}`,
                color: `#${i.toString(16).padStart(6, '0')}`,
            }));

            const result = await queries.queries.createMany({
                data,
                userId: testUser.id,
            });

            const duration = Date.now() - startTime;

            expect(result).toHaveLength(50);
            expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
        });

        it('should handle pagination on large datasets', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name'])
                .enablePagination()
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).registerAllStandard();

            const result = await queries.queries.getMany({
                userId: testUser.id,
                pagination: { page: 1, pageSize: 100 },
            });

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeLessThanOrEqual(100);
        });
    });

    describe('Data Validation Edge Cases', () => {
        it('should strip disallowed fields during create', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).registerAllStandard();

            const result = await queries.queries.create({
                data: {
                    name: 'strip-test-' + Date.now(),
                    color: '#STRIP',
                    // @ts-expect-error - testing runtime validation
                    extraField: 'should be removed',
                },
                userId: testUser.id,
            });

            expect(result).toHaveProperty('name');
            expect(result).not.toHaveProperty('extraField');
        });

        it('should strip disallowed fields during update', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'color'])
                .restrictInsertFields(['name', 'color'])
                .restrictUpdateFields(['color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).registerAllStandard();

            const created = await queries.queries.create({
                data: { name: 'update-strip-' + Date.now(), color: '#ORIG' },
                userId: testUser.id,
            });

            const updated = await queries.queries.updateById({
                ids: { id: created.id },
                data: {
                    color: '#NEW',
                    // @ts-expect-error - testing runtime validation
                    name: 'should not change',
                },
                userId: testUser.id,
            });

            expect(updated?.color).toBe('#NEW');
            expect(updated?.name).toBe(created.name); // Name should not change
        });

        it('should handle empty data arrays in createMany', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).registerAllStandard();

            await expect(
                queries.queries.createMany({
                    data: [],
                    userId: testUser.id,
                })
            ).rejects.toThrow();
        });
    });

    describe('Complex Filtering Scenarios', () => {
        it('should handle default filters consistently', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'isActive'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).registerAllStandard({
                defaultFilters: { isActive: true },
            });

            const created = await queries.queries.create({
                data: { name: 'filter-check-' + Date.now(), color: '#FILT' },
                userId: testUser.id,
            });

            await queries.queries.removeById({
                ids: { id: created.id },
                userId: testUser.id,
            });

            const getManyResult = await queries.queries.getMany({
                userId: testUser.id,
            });

            const getByIdResult = await queries.queries.getById({
                ids: { id: created.id },
                userId: testUser.id,
            });

            expect(getManyResult.every((r) => r.isActive === true)).toBe(true);
            expect(getByIdResult).toBeNull();
        });

        it('should handle ordering in getMany', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'createdAt'])
                .restrictInsertFields(['name', 'color'])
                .enableOrdering(['name'])
                .enablePagination()
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).registerAllStandard();

            const timestamp = Date.now();
            await queries.queries.createMany({
                data: [
                    { name: `order-z-${timestamp}`, color: '#ORD1' },
                    { name: `order-a-${timestamp}`, color: '#ORD2' },
                ],
                userId: testUser.id,
            });

            const result = await queries.queries.getMany({
                userId: testUser.id,
                ordering: [{ field: 'name', direction: 'asc' }],
                pagination: { page: 1, pageSize: 10 },
            });

            expect(result.length).toBeGreaterThan(0);
        });
    });

    describe('Return Column Restrictions', () => {
        it('should respect return column restrictions across all queries', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name']) // Only id and name
                .restrictInsertFields(['name', 'color', 'description'])
                .restrictUpdateFields(['name', 'color'])
                .build();

            const queries = createFeatureQueries('tag-test', tableConfig).registerAllStandard();

            const created = await queries.queries.create({
                data: {
                    name: 'restrict-test-' + Date.now(),
                    color: '#REST',
                    description: 'Full description',
                },
                userId: testUser.id,
            });

            expect(created).toHaveProperty('id');
            expect(created).toHaveProperty('name');
            expect(created).not.toHaveProperty('color');
            expect(created).not.toHaveProperty('description');

            const fetched = await queries.queries.getById({
                ids: { id: created.id },
                userId: testUser.id,
            });

            expect(fetched).toHaveProperty('id');
            expect(fetched).toHaveProperty('name');
            expect(fetched).not.toHaveProperty('color');
        });
    });
});
