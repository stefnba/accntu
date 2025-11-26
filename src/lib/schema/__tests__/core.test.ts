import { createFeatureSchemas } from '@/lib/schema/factory';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { describe, expect, test } from 'vitest';

// Define a mock table for testing
const mockTable = pgTable('mock_table', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    userId: text('user_id').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

// Create a standard table config
const mockConfig = createFeatureTableConfig(mockTable)
    .restrictInsertFields(['name', 'description'])
    .restrictUpdateFields(['name', 'description'])
    .restrictReturnColumns(['id', 'name', 'description', 'userId'])
    .build();

describe('FeatureSchemasBuilder', () => {
    test('should build standard schemas correctly', () => {
        const schemas = createFeatureSchemas(mockConfig).registerAllStandard().build();

        // Verify keys exist
        expect(schemas).toHaveProperty('create');
        expect(schemas).toHaveProperty('createMany');
        expect(schemas).toHaveProperty('updateById');
        expect(schemas).toHaveProperty('getById');
        expect(schemas).toHaveProperty('removeById');
        expect(schemas).toHaveProperty('getMany');

        // Verify create schema structure
        const create = schemas.create;
        expect(create.service).toBeDefined();
        expect(create.endpoint?.json).toBeDefined();
        expect(create.query).toBeDefined();

        // Validate input with generated schema
        const validInput = { name: 'Test', userId: 'user-1' };
        expect(create.service?.safeParse({ data: validInput, userId: 'user-1' }).success).toBe(
            true
        );
    });

    test('should allow selective standard schemas via withStandard', () => {
        const schemas = createFeatureSchemas(mockConfig)
            .withStandard((b) => b.create().getById())
            .build();

        expect(schemas).toHaveProperty('create');
        expect(schemas).toHaveProperty('getById');
        expect(schemas).not.toHaveProperty('updateById');
        expect(schemas).not.toHaveProperty('removeById');
    });

    test('should support custom schema definition', () => {
        const schemas = createFeatureSchemas(mockConfig)
            .addSchema('customOp', ({ schemas, helpers }) => ({
                service: helpers.buildIdentifierSchema(),
                endpoint: {
                    param: schemas.id,
                    json: schemas.inputData.update,
                },
                query: schemas.return,
            }))
            .build();

        expect(schemas).toHaveProperty('customOp');

        const custom = schemas.customOp;

        // Test service schema (identifier: ids + userId)
        expect(
            custom.service?.safeParse({
                ids: { id: 'uuid-123' },
                userId: 'user-1',
            }).success
        ).toBe(true);

        // Test endpoint param (just id)
        expect(custom.endpoint?.param?.safeParse({ id: 'uuid-123' }).success).toBe(true);

        // Test endpoint json (update data: name, description)
        expect(custom.endpoint?.json?.safeParse({ name: 'New Name' }).success).toBe(true);
        // Should fail on unauthorized field if not in updateData
        // (Note: updateData comes from restrictUpdateFields in config)
    });

    test('should correctly infer standard getMany endpoint query excluding userId', () => {
        const schemas = createFeatureSchemas(mockConfig).registerAllStandard().build();

        const getManyEndpoint = schemas.getMany.endpoint?.query;
        expect(getManyEndpoint).toBeDefined();

        // Should accept pagination/filters if configured (empty by default here but valid object)
        expect(getManyEndpoint?.safeParse({}).success).toBe(true);

        // Manually checking type behavior - userId should NOT be required in endpoint query
        // The actual runtime check:
        const result = getManyEndpoint?.safeParse({ userId: 'hacking-attempt' });
        // Zod object (strict/strip) behavior depends on config, but standard build uses z.object() which strips unknown by default
        // The key is that validation shouldn't fail if passed, but it definitely shouldn't be REQUIRED.
        expect(result?.success).toBe(true);
    });
});
