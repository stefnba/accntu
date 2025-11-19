import { beforeAll, describe, expect, it } from 'vitest';

import { createTestUser } from '@/../test/utils/create-user';
import { tag } from '@/features/tag/server/db/tables';
import { StandardQueryBuilder } from '@/server/lib/db/query/feature-queries/standard';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';

describe('StandardQueryBuilder', () => {
    let testUser: Awaited<ReturnType<typeof createTestUser>>;

    beforeAll(async () => {
        testUser = await createTestUser();
    });

    describe('Builder Creation', () => {
        it('should create a standard query builder', () => {
            const tableConfig = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name', 'color'])
                .build();

            const builder = StandardQueryBuilder.create(tableConfig);

            expect(builder).toBeDefined();
            expect(builder.table).toBe(tag);
            expect(builder.tableConfig).toBe(tableConfig);
            expect(builder.queries).toEqual({});
        });

        it('should create with query config', () => {
            const tableConfig = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name', 'color'])
                .build();

            const builder = StandardQueryBuilder.create(tableConfig, {
                defaultFilters: { isActive: true },
            });

            expect(builder.queryConfig).toHaveProperty('defaultFilters');
            expect(builder.queryConfig.defaultFilters).toEqual({ isActive: true });
        });
    });

    describe('Fluent Builder Pattern', () => {
        it('should chain create() method', () => {
            const tableConfig = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name', 'color', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .setUserId('userId')
                .build();

            const builder = StandardQueryBuilder.create(tableConfig).create();

            expect(builder.queries).toHaveProperty('create');
            expect(typeof builder.queries.create).toBe('function');
        });

        it('should chain getById() method', () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'color'])
                .build();

            const builder = StandardQueryBuilder.create(tableConfig).getById();

            expect(builder.queries).toHaveProperty('getById');
            expect(typeof builder.queries.getById).toBe('function');
        });

        it('should chain getMany() method', () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'color'])
                .build();

            const builder = StandardQueryBuilder.create(tableConfig).getMany();

            expect(builder.queries).toHaveProperty('getMany');
            expect(typeof builder.queries.getMany).toBe('function');
        });

        it('should chain updateById() method', () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'color'])
                .restrictUpdateFields(['name', 'color'])
                .build();

            const builder = StandardQueryBuilder.create(tableConfig).updateById();

            expect(builder.queries).toHaveProperty('updateById');
            expect(typeof builder.queries.updateById).toBe('function');
        });

        it('should chain removeById() method', () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .build();

            const builder = StandardQueryBuilder.create(tableConfig).removeById();

            expect(builder.queries).toHaveProperty('removeById');
            expect(typeof builder.queries.removeById).toBe('function');
        });

        it('should chain createMany() method', () => {
            const tableConfig = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name', 'color', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .setUserId('userId')
                .build();

            const builder = StandardQueryBuilder.create(tableConfig).createMany();

            expect(builder.queries).toHaveProperty('createMany');
            expect(typeof builder.queries.createMany).toBe('function');
        });

        it('should chain multiple methods', () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'color', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .restrictUpdateFields(['name', 'color'])
                .build();

            const builder = StandardQueryBuilder.create(tableConfig)
                .create()
                .getById()
                .getMany()
                .updateById();

            expect(builder.queries).toHaveProperty('create');
            expect(builder.queries).toHaveProperty('getById');
            expect(builder.queries).toHaveProperty('getMany');
            expect(builder.queries).toHaveProperty('updateById');
        });

        it('should use all() to register all standard queries', () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'color', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .restrictUpdateFields(['name', 'color'])
                .build();

            const builder = StandardQueryBuilder.create(tableConfig).all();

            expect(builder.queries).toHaveProperty('create');
            expect(builder.queries).toHaveProperty('createMany');
            expect(builder.queries).toHaveProperty('getById');
            expect(builder.queries).toHaveProperty('getMany');
            expect(builder.queries).toHaveProperty('updateById');
            expect(builder.queries).toHaveProperty('removeById');
        });
    });

    describe('Create Query', () => {
        it('should create a record', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'color', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).create().done();

            const result = await queries.create({
                data: { name: 'standard-create-' + Date.now(), color: '#FF0000' },
                userId: testUser.id,
            });

            expect(result).toBeDefined();
            expect(result.name).toContain('standard-create-');
            expect(result.color).toBe('#FF0000');
            expect(result.userId).toBe(testUser.id);
        });

        it('should auto-inject userId in create', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).create().done();

            const result = await queries.create({
                data: { name: 'auto-userid-' + Date.now(), color: '#00FF00' },
                userId: testUser.id,
            });

            expect(result.userId).toBe(testUser.id);
        });

        it('should respect return columns in create', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).create().done();

            const result = await queries.create({
                data: { name: 'return-test-' + Date.now(), color: '#0000FF' },
                userId: testUser.id,
            });

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('name');
            expect(result).not.toHaveProperty('color');
        });
    });

    describe('CreateMany Query', () => {
        it('should create many records', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'color', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).createMany().done();
            const timestamp = Date.now();

            const result = await queries.createMany({
                data: [
                    { name: `bulk-1-${timestamp}`, color: '#111111' },
                    { name: `bulk-2-${timestamp}`, color: '#222222' },
                ],
                userId: testUser.id,
            });

            expect(result).toHaveLength(2);
            expect(result[0].userId).toBe(testUser.id);
            expect(result[1].userId).toBe(testUser.id);
        });

        it('should auto-inject userId in createMany', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).createMany().done();

            const result = await queries.createMany({
                data: [{ name: 'bulk-userid-' + Date.now(), color: '#AAAAAA' }],
                userId: testUser.id,
            });

            expect(result[0].userId).toBe(testUser.id);
        });
    });

    describe('GetById Query', () => {
        it('should get a record by id', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'color', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).create().getById().done();

            const created = await queries.create({
                data: { name: 'getbyid-test-' + Date.now(), color: '#BBBBBB' },
                userId: testUser.id,
            });

            const result = await queries.getById({
                ids: { id: created.id },
                userId: testUser.id,
            });

            expect(result).toBeDefined();
            expect(result?.id).toBe(created.id);
        });

        it('should return null when record not found', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).getById().done();

            const result = await queries.getById({
                ids: { id: 'non-existent-' + Date.now() },
                userId: testUser.id,
            });

            expect(result).toBeNull();
        });

        it('should enforce userId scoping', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).create().getById().done();

            const otherUser = await createTestUser();
            const created = await queries.create({
                data: { name: 'scope-test-' + Date.now(), color: '#CCCCCC' },
                userId: testUser.id,
            });

            const result = await queries.getById({
                ids: { id: created.id },
                userId: otherUser.id,
            });

            expect(result).toBeNull();
        });

        it('should throw when ids are missing', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).getById().done();

            await expect(
                // @ts-expect-error - testing runtime error
                queries.getById({
                    userId: testUser.id,
                })
            ).rejects.toThrow('Identifiers are required for getById query');
        });
    });

    describe('GetMany Query', () => {
        it('should get many records', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'color', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).createMany().getMany().done();

            const timestamp = Date.now();
            await queries.createMany({
                data: [
                    { name: `many-1-${timestamp}`, color: '#111111' },
                    { name: `many-2-${timestamp}`, color: '#222222' },
                ],
                userId: testUser.id,
            });

            const result = await queries.getMany({
                userId: testUser.id,
            });

            expect(result.length).toBeGreaterThanOrEqual(2);
        });

        it('should support pagination', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).getMany().done();

            const result = await queries.getMany({
                userId: testUser.id,
                pagination: { page: 1, pageSize: 5 },
            });

            expect(result.length).toBeLessThanOrEqual(5);
        });

        it('should support orderBy', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'createdAt'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).createMany().getMany().done();

            const timestamp = Date.now();
            await queries.createMany({
                data: [
                    { name: `order-a-${timestamp}`, color: '#000001' },
                    { name: `order-b-${timestamp}`, color: '#000002' },
                ],
                userId: testUser.id,
            });

            const result = await queries.getMany({
                userId: testUser.id,
                orderBy: { createdAt: 'desc' },
                pagination: { page: 1, pageSize: 10 },
            });

            expect(result.length).toBeGreaterThan(0);
        });

        it('should support custom filters', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'isActive'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig, {
                defaultFilters: { isActive: true },
            })
                .getMany()
                .done();

            const result = await queries.getMany({
                userId: testUser.id,
            });

            // Should only return active records
            expect(result.every((r) => r.isActive === true)).toBe(true);
        });
    });

    describe('UpdateById Query', () => {
        it('should update a record by id', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'color', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .restrictUpdateFields(['name', 'color'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).create().updateById().done();

            const created = await queries.create({
                data: { name: 'update-test-' + Date.now(), color: '#DDDDDD' },
                userId: testUser.id,
            });

            const updated = await queries.updateById({
                ids: { id: created.id },
                data: { color: '#EEEEEE' },
                userId: testUser.id,
            });

            expect(updated).toBeDefined();
            expect(updated?.color).toBe('#EEEEEE');
            expect(updated?.name).toBe(created.name);
        });

        it('should return null when updating non-existent record', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name'])
                .restrictUpdateFields(['name', 'color'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).updateById().done();

            const result = await queries.updateById({
                ids: { id: 'non-existent-' + Date.now() },
                data: { color: '#000000' },
                userId: testUser.id,
            });

            expect(result).toBeNull();
        });

        it('should enforce userId scoping in updates', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .restrictUpdateFields(['color'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).create().updateById().done();

            const otherUser = await createTestUser();
            const created = await queries.create({
                data: { name: 'update-scope-' + Date.now(), color: '#F0F0F0' },
                userId: testUser.id,
            });

            const result = await queries.updateById({
                ids: { id: created.id },
                data: { color: '#0F0F0F' },
                userId: otherUser.id,
            });

            expect(result).toBeNull();
        });

        it('should support partial updates', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'color', 'userId'])
                .restrictInsertFields(['name', 'color', 'description'])
                .restrictUpdateFields(['name', 'color', 'description'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).create().updateById().done();

            const created = await queries.create({
                data: { name: 'partial-' + Date.now(), color: '#AAAAAA', description: 'Original' },
                userId: testUser.id,
            });

            const updated = await queries.updateById({
                ids: { id: created.id },
                data: { color: '#BBBBBB' }, // Only update color
                userId: testUser.id,
            });

            expect(updated).toBeDefined();
            expect(updated?.color).toBe('#BBBBBB');
            expect(updated?.name).toBe(created.name);
        });
    });

    describe('RemoveById Query', () => {
        it('should soft delete a record by default', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'isActive'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig, {
                defaultFilters: { isActive: true },
            })
                .create()
                .getById()
                .removeById()
                .done();

            const created = await queries.create({
                data: { name: 'remove-test-' + Date.now(), color: '#FEDCBA' },
                userId: testUser.id,
            });

            await queries.removeById({
                ids: { id: created.id },
                userId: testUser.id,
            });

            // Should not be found with default filter
            const result = await queries.getById({
                ids: { id: created.id },
                userId: testUser.id,
            });

            expect(result).toBeNull();
        });

        it('should enforce userId scoping in remove', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).create().removeById().done();

            const otherUser = await createTestUser();
            const created = await queries.create({
                data: { name: 'remove-scope-' + Date.now(), color: '#ABCABC' },
                userId: testUser.id,
            });

            // Should not remove when userId doesn't match
            const result = await queries.removeById({
                ids: { id: created.id },
                userId: otherUser.id,
            });

            expect(result).toBeUndefined();
        });
    });

    describe('Default Filters', () => {
        it('should apply default filters to getById', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'isActive'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig, {
                defaultFilters: { isActive: true },
            })
                .create()
                .getById()
                .removeById()
                .done();

            const created = await queries.create({
                data: { name: 'filter-test-' + Date.now(), color: '#FILTER1' },
                userId: testUser.id,
            });

            await queries.removeById({
                ids: { id: created.id },
                userId: testUser.id,
            });

            const result = await queries.getById({
                ids: { id: created.id },
                userId: testUser.id,
            });

            expect(result).toBeNull();
        });

        it('should apply default filters to getMany', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'isActive'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig, {
                defaultFilters: { isActive: true },
            })
                .getMany()
                .done();

            const result = await queries.getMany({
                userId: testUser.id,
            });

            expect(result.every((r) => r.isActive === true)).toBe(true);
        });
    });

    describe('Type Safety', () => {
        it('should provide type-safe query inputs', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'color', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .restrictUpdateFields(['name', 'color'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).all().done();

            // TypeScript should enforce these at compile time
            expect(queries).toHaveProperty('create');
            expect(queries).toHaveProperty('createMany');
            expect(queries).toHaveProperty('getById');
            expect(queries).toHaveProperty('getMany');
            expect(queries).toHaveProperty('updateById');
            expect(queries).toHaveProperty('removeById');
        });

        it('should respect table config restrictions', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).create().done();

            const result = await queries.create({
                data: { name: 'type-test-' + Date.now(), color: '#TYPE001' },
                userId: testUser.id,
            });

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('name');
            expect(result).not.toHaveProperty('color');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty filters', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig, {}).getMany().done();

            const result = await queries.getMany({
                userId: testUser.id,
            });

            expect(Array.isArray(result)).toBe(true);
        });

        it('should handle large pagination values', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).getMany().done();

            const result = await queries.getMany({
                userId: testUser.id,
                pagination: { page: 999999, pageSize: 1000 },
            });

            expect(Array.isArray(result)).toBe(true);
        });

        it('should handle multiple id fields', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id', 'userId'])
                .restrictReturnColumns(['id', 'name', 'userId'])
                .build();

            const builder = StandardQueryBuilder.create(tableConfig).getById();

            expect(builder.queries).toHaveProperty('getById');
        });

        it('should throw when userId is missing but required', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).getMany().done();

            await expect(
                // @ts-expect-error - testing runtime error
                queries.getMany({})
            ).rejects.toThrow();
        });
    });

    describe('Integration Tests', () => {
        it('should work end-to-end with all queries', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'color', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .restrictUpdateFields(['name', 'color'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig, {
                defaultFilters: { isActive: true },
            })
                .all()
                .done();

            // Create
            const created = await queries.create({
                data: { name: 'e2e-test-' + Date.now(), color: '#E2E001' },
                userId: testUser.id,
            });
            expect(created).toBeDefined();

            // GetById
            const fetched = await queries.getById({
                ids: { id: created.id },
                userId: testUser.id,
            });
            expect(fetched?.id).toBe(created.id);

            // Update
            const updated = await queries.updateById({
                ids: { id: created.id },
                data: { color: '#E2E002' },
                userId: testUser.id,
            });
            expect(updated?.color).toBe('#E2E002');

            // GetMany
            const many = await queries.getMany({
                userId: testUser.id,
            });
            expect(many.length).toBeGreaterThan(0);

            // Remove
            await queries.removeById({
                ids: { id: created.id },
                userId: testUser.id,
            });

            // Verify removed
            const removed = await queries.getById({
                ids: { id: created.id },
                userId: testUser.id,
            });
            expect(removed).toBeNull();
        });

        it('should work with createMany and getMany', async () => {
            const tableConfig = createFeatureTableConfig(tag)
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'userId'])
                .restrictInsertFields(['name', 'color'])
                .build();

            const queries = StandardQueryBuilder.create(tableConfig).createMany().getMany().done();

            const timestamp = Date.now();
            const created = await queries.createMany({
                data: [
                    { name: `bulk-e2e-1-${timestamp}`, color: '#BULK01' },
                    { name: `bulk-e2e-2-${timestamp}`, color: '#BULK02' },
                ],
                userId: testUser.id,
            });

            expect(created).toHaveLength(2);

            const fetched = await queries.getMany({
                userId: testUser.id,
            });

            expect(fetched.length).toBeGreaterThanOrEqual(2);
        });
    });
});
