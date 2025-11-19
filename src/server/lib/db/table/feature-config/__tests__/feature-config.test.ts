import { createTestUser } from '@/../test/utils/create-user';

import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { createId } from '@paralleldrive/cuid2';
import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { beforeAll, describe, expect, it } from 'vitest';

// Create a minimal test table inline to avoid import side-effects
const tag = pgTable('tag', {
    id: text()
        .primaryKey()
        .$defaultFn(() => createId()),
    userId: text().notNull(),
    name: text().notNull(),
    color: text().notNull(),
    description: text(),
    isActive: boolean().notNull().default(true),
    transactionCount: integer().notNull().default(0),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp(),
});

describe('FeatureTableConfig', () => {
    let testUser: Awaited<ReturnType<typeof createTestUser>>;

    beforeAll(async () => {
        testUser = await createTestUser();
    });

    describe('Basic Configuration', () => {
        it('should create a basic config with defaults', () => {
            const config = createFeatureTableConfig(tag).build();

            expect(config).toBeDefined();
            expect(config.table).toBe(tag);
            expect(config.baseSchema).toBeDefined();
            expect(config.insertDataSchema).toBeDefined();
            expect(config.updateDataSchema).toBeDefined();
            expect(config.selectReturnSchema).toBeDefined();
        });

        it('should auto-detect id field from table', () => {
            const config = createFeatureTableConfig(tag).build();

            expect(config.idSchema).toBeDefined();
            expect(config.hasIds()).toBe(true);
            expect(Object.keys(config.idSchema.shape)).toContain('id');
        });

        it('should auto-detect userId field from table', () => {
            const config = createFeatureTableConfig(tag).build();

            expect(config.userIdSchema).toBeDefined();
            expect(config.hasUserId()).toBe(true);
            expect(Object.keys(config.userIdSchema.shape)).toContain('userId');
        });
    });

    describe('ID Configuration', () => {
        it('should set single id field', () => {
            const config = createFeatureTableConfig(tag).setIds(['id']).build();

            expect(config.hasIds()).toBe(true);
            expect(Object.keys(config.idSchema.shape)).toHaveLength(1);
            expect(config.idSchema.shape).toHaveProperty('id');
        });

        it('should set multiple id fields', () => {
            const config = createFeatureTableConfig(tag).setIds(['id', 'userId']).build();

            expect(config.hasIds()).toBe(true);
            expect(Object.keys(config.idSchema.shape)).toHaveLength(2);
            expect(config.idSchema.shape).toHaveProperty('id');
            expect(config.idSchema.shape).toHaveProperty('userId');
        });

        it('should get id columns', () => {
            const config = createFeatureTableConfig(tag).setIds(['id', 'userId']).build();

            const idColumns = config.getIdsFieldNames();
            expect(idColumns).toEqual(['id', 'userId']);
        });
    });

    describe('UserId Configuration', () => {
        it('should set userId field', () => {
            const config = createFeatureTableConfig(tag).setUserId('userId').build();

            expect(config.hasUserId()).toBe(true);
            expect(Object.keys(config.userIdSchema.shape)).toHaveLength(1);
            expect(config.userIdSchema.shape).toHaveProperty('userId');
        });

        it('should get userId column', () => {
            const config = createFeatureTableConfig(tag).setUserId('userId').build();

            const userIdColumn = config.getUserIdFieldName();
            expect(userIdColumn).toBe('userId');
        });

        it('should get auto-detected userId field name', () => {
            const config = createFeatureTableConfig(tag).build();

            const userIdColumn = config.getUserIdFieldName();
            expect(userIdColumn).toBe('userId');
        });
    });

    describe('Return Columns Configuration', () => {
        it('should restrict return columns', () => {
            const config = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name', 'color'])
                .build();

            const columns = config.getReturnColumns();
            expect(columns).toEqual(['id', 'name', 'color']);
            expect(columns).toHaveLength(3);
        });

        it('should get all columns when not restricted', () => {
            const config = createFeatureTableConfig(tag).build();

            const columns = config.getReturnColumns();
            expect(columns.length).toBeGreaterThan(5);
            expect(columns).toContain('id');
            expect(columns).toContain('name');
            expect(columns).toContain('color');
        });

        it('should respect return column restrictions in schema', () => {
            const config = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name'])
                .build();

            expect(config.selectReturnSchema.shape).toHaveProperty('id');
            expect(config.selectReturnSchema.shape).toHaveProperty('name');
            expect(config.selectReturnSchema.shape).not.toHaveProperty('color');
        });
    });

    describe('Insert Fields Configuration', () => {
        it('should restrict insert fields', () => {
            const config = createFeatureTableConfig(tag)
                .restrictInsertFields(['name', 'color', 'description'])
                .build();

            const fields = Object.keys(config.insertDataSchema.shape);
            expect(fields).toEqual(['name', 'color', 'description']);
        });

        it('should allow all fields when not restricted', () => {
            const config = createFeatureTableConfig(tag).build();

            const fields = Object.keys(config.insertDataSchema.shape);
            expect(fields.length).toBeGreaterThan(3);
            expect(fields).toContain('name');
            expect(fields).toContain('color');
        });

        it('should exclude system fields from insert by default', () => {
            const config = createFeatureTableConfig(tag).build();

            const fields = Object.keys(config.insertDataSchema.shape);
            // System fields like createdAt, updatedAt should not be in insert data
            expect(fields).not.toContain('createdAt');
            expect(fields).not.toContain('updatedAt');
        });
    });

    describe('Update Fields Configuration', () => {
        it('should restrict update fields', () => {
            const config = createFeatureTableConfig(tag)
                .restrictUpdateFields(['name', 'color', 'description'])
                .build();

            const fields = Object.keys(config.updateDataSchema.shape);
            expect(fields).toEqual(['name', 'color', 'description']);
        });

        it('should make update fields partial', () => {
            const config = createFeatureTableConfig(tag)
                .restrictUpdateFields(['name', 'color'])
                .build();

            const result = config.updateDataSchema.safeParse({});
            expect(result.success).toBe(true);
        });

        it('should exclude id and userId from updates', () => {
            const config = createFeatureTableConfig(tag).setIds(['id']).setUserId('userId').build();

            const fields = Object.keys(config.updateDataSchema.shape);
            expect(fields).not.toContain('id');
            expect(fields).not.toContain('userId');
        });
    });

    describe('Schema Validation', () => {
        it('should validate identifier schema', () => {
            const config = createFeatureTableConfig(tag).setIds(['id']).setUserId('userId').build();

            const schema = config.buildIdentifierSchema();
            const result = schema.safeParse({
                ids: { id: 'test-id' },
                userId: testUser.id,
            });

            expect(result.success).toBe(true);
        });

        it('should validate create input schema', () => {
            const config = createFeatureTableConfig(tag)
                .restrictInsertFields(['name', 'color'])
                .setUserId('userId')
                .build();

            const schema = config.buildCreateInputSchema();
            const result = schema.safeParse({
                data: { name: 'Test', color: '#FF0000' },
                userId: testUser.id,
            });

            expect(result.success).toBe(true);
        });

        it('should validate create many input schema', () => {
            const config = createFeatureTableConfig(tag)
                .restrictInsertFields(['name', 'color'])
                .setUserId('userId')
                .build();

            const schema = config.buildCreateManyInputSchema();
            const result = schema.safeParse({
                data: [
                    { name: 'Test 1', color: '#FF0000' },
                    { name: 'Test 2', color: '#00FF00' },
                ],
                userId: testUser.id,
            });

            expect(result.success).toBe(true);
        });

        it('should validate update input schema', () => {
            const config = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictUpdateFields(['name', 'color'])
                .build();

            const schema = config.buildUpdateInputSchema();
            const result = schema.safeParse({
                ids: { id: 'test-id' },
                data: { color: '#0000FF' },
                userId: testUser.id,
            });

            expect(result.success).toBe(true);
        });
    });

    describe('Data Validation for Table Operations', () => {
        it('should validate data for table insert', () => {
            const config = createFeatureTableConfig(tag)
                .restrictInsertFields(['name', 'color'])
                .setUserId('userId')
                .build();

            const validated = config.validateDataForTableInsert({
                data: { name: 'Test', color: '#FF0000' },
                userId: testUser.id,
            });

            expect(validated).toHaveProperty('name', 'Test');
            expect(validated).toHaveProperty('color', '#FF0000');
            expect(validated).toHaveProperty('userId', testUser.id);
        });

        it('should validate data for table insert many', () => {
            const config = createFeatureTableConfig(tag)
                .restrictInsertFields(['name', 'color'])
                .setUserId('userId')
                .build();

            const validated = config.validateDataForTableInsertMany({
                data: [
                    { name: 'Test 1', color: '#FF0000' },
                    { name: 'Test 2', color: '#00FF00' },
                ],
                userId: testUser.id,
            });

            expect(validated).toHaveLength(2);
            expect(validated[0]).toHaveProperty('userId', testUser.id);
            expect(validated[1]).toHaveProperty('userId', testUser.id);
        });

        it('should validate update data for table update', () => {
            const config = createFeatureTableConfig(tag)
                .restrictUpdateFields(['name', 'color'])
                .setIds(['id'])
                .setUserId('userId')
                .build();

            const validated = config.validateUpdateDataForTableUpdate({
                ids: { id: 'test-id' },
                data: { color: '#0000FF' },
                userId: testUser.id,
            });

            expect(validated).toHaveProperty('color', '#0000FF');
            expect(validated).not.toHaveProperty('id');
            expect(validated).not.toHaveProperty('userId');
        });

        it('should strip extra fields during validation', () => {
            const config = createFeatureTableConfig(tag)
                .restrictInsertFields(['name', 'color'])
                .setUserId('userId')
                .build();

            const validated = config.validateDataForTableInsert({
                data: {
                    name: 'Test',
                    color: '#FF0000',
                    extraField: 'should be removed',
                },
                userId: testUser.id,
            });

            expect(validated).toHaveProperty('name');
            expect(validated).toHaveProperty('color');
            expect(validated).not.toHaveProperty('extraField');
        });
    });

    describe('Chaining Configuration', () => {
        it('should chain multiple configurations', () => {
            const config = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'color'])
                .restrictInsertFields(['name', 'color'])
                .restrictUpdateFields(['name', 'color'])
                .build();

            expect(config.hasIds()).toBe(true);
            expect(config.hasUserId()).toBe(true);
            expect(config.getReturnColumns()).toHaveLength(3);
            expect(Object.keys(config.insertDataSchema.shape)).toHaveLength(2);
            expect(Object.keys(config.updateDataSchema.shape)).toHaveLength(2);
        });

        it('should have all expected properties after build', () => {
            const config = createFeatureTableConfig(tag).build();

            // Verify all properties are present
            expect(config.table).toBeDefined();
            expect(config.idSchema).toBeDefined();
            expect(config.userIdSchema).toBeDefined();
            expect(config.baseSchema).toBeDefined();
            expect(config.insertDataSchema).toBeDefined();
            expect(config.updateDataSchema).toBeDefined();
            expect(config.selectReturnSchema).toBeDefined();
        });
    });

    describe('Type Safety', () => {
        it('should enforce type-safe column selection', () => {
            const config = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name', 'color'])
                .build();

            const columns = config.getReturnColumns();

            // TypeScript should enforce this at compile time
            expect(columns).toContain('id');
            expect(columns).toContain('name');
            expect(columns).toContain('color');
        });

        it('should infer correct types from configuration', () => {
            const config = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictInsertFields(['name', 'color'])
                .build();

            // Test schema types
            const insertSchema = config.insertDataSchema;
            expect(insertSchema.shape).toHaveProperty('name');
            expect(insertSchema.shape).toHaveProperty('color');
        });
    });

    describe('Edge Cases', () => {
        it('should handle restricted return columns to minimal set', () => {
            const config = createFeatureTableConfig(tag).restrictReturnColumns(['id']).build();

            const columns = config.getReturnColumns();
            expect(columns).toEqual(['id']);
        });

        it('should handle empty insert fields array', () => {
            const config = createFeatureTableConfig(tag).restrictInsertFields([]).build();

            const fields = Object.keys(config.insertDataSchema.shape);
            expect(fields).toHaveLength(0);
        });

        it('should handle manually removing ids', () => {
            const config = createFeatureTableConfig(tag).removeIds().build();

            expect(config.hasIds()).toBe(false);
            expect(config.hasUserId()).toBe(true); // userId still auto-detected
        });

        it('should handle manually removing userId', () => {
            const config = createFeatureTableConfig(tag).removeUserId().build();

            expect(config.hasIds()).toBe(true); // id still auto-detected
            expect(config.hasUserId()).toBe(false);
        });

        it('should handle validation with missing userId when required', () => {
            const config = createFeatureTableConfig(tag)
                .restrictInsertFields(['name'])
                .setUserId('userId')
                .build();

            const schema = config.buildCreateInputSchema();
            const result = schema.safeParse({
                data: { name: 'Test' },
                // userId missing
            });

            expect(result.success).toBe(false);
        });

        it('should handle validation with missing ids when required', () => {
            const config = createFeatureTableConfig(tag).setIds(['id']).setUserId('userId').build();

            const schema = config.buildIdentifierSchema();
            const result = schema.safeParse({
                // ids missing
                userId: testUser.id,
            });

            expect(result.success).toBe(false);
        });
    });

    describe('System Fields Handling', () => {
        it('should exclude system fields from insert data', () => {
            const config = createFeatureTableConfig(tag).build();

            const fields = Object.keys(config.insertDataSchema.shape);
            expect(fields).not.toContain('id');
            expect(fields).not.toContain('createdAt');
            expect(fields).not.toContain('updatedAt');
        });

        it('should exclude id and userId from update data', () => {
            const config = createFeatureTableConfig(tag).setIds(['id']).setUserId('userId').build();

            const fields = Object.keys(config.updateDataSchema.shape);
            expect(fields).not.toContain('id');
            expect(fields).not.toContain('userId');
        });

        it('should allow custom system field exclusions', () => {
            const config = createFeatureTableConfig(tag)
                .restrictUpdateFields(['name', 'color'])
                .build();

            const fields = Object.keys(config.updateDataSchema.shape);
            expect(fields).toEqual(['name', 'color']);
        });
    });

    describe('Complex Configurations', () => {
        it('should handle complex multi-tenant setup', () => {
            const config = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictReturnColumns(['id', 'name', 'color', 'userId'])
                .restrictInsertFields(['name', 'color', 'description'])
                .restrictUpdateFields(['name', 'color', 'description'])
                .build();

            expect(config.hasIds()).toBe(true);
            expect(config.hasUserId()).toBe(true);
            expect(config.getReturnColumns()).toContain('userId');

            // Should auto-inject userId in creates
            const validated = config.validateDataForTableInsert({
                data: { name: 'Test', color: '#FF0000' },
                userId: testUser.id,
            });

            expect(validated).toHaveProperty('userId', testUser.id);
        });

        it('should handle partial updates correctly', () => {
            const config = createFeatureTableConfig(tag)
                .setIds(['id'])
                .setUserId('userId')
                .restrictUpdateFields(['name', 'color', 'description'])
                .build();

            // Should allow partial updates
            const validated = config.validateUpdateDataForTableUpdate({
                ids: { id: 'test-id' },
                data: { color: '#FF0000' }, // Only updating color
                userId: testUser.id,
            });

            expect(validated).toHaveProperty('color');
            expect(validated).not.toHaveProperty('name');
        });

        it('should handle read-only fields in return schema', () => {
            const config = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name', 'color', 'createdAt', 'updatedAt'])
                .restrictInsertFields(['name', 'color'])
                .restrictUpdateFields(['name', 'color'])
                .build();

            const returnFields = config.getReturnColumns();
            const insertFields = Object.keys(config.insertDataSchema.shape);
            const updateFields = Object.keys(config.updateDataSchema.shape);

            expect(returnFields).toContain('createdAt');
            expect(returnFields).toContain('updatedAt');
            expect(insertFields).not.toContain('createdAt');
            expect(insertFields).not.toContain('updatedAt');
            expect(updateFields).not.toContain('createdAt');
            expect(updateFields).not.toContain('updatedAt');
        });
    });
});
