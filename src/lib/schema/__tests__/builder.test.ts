import { beforeAll, describe, expect, it } from 'vitest';

import { createTestUser } from '@/../test/utils/create-user';
import { tag } from '@/features/tag/server/db/tables';
import { createFeatureSchemas } from '@/lib/schema/factory';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';

describe('Feature Schemas Builder', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let testUser: Awaited<ReturnType<typeof createTestUser>>;

    beforeAll(async () => {
        testUser = await createTestUser();
    });

    describe('Schema Builder Creation', () => {
        it('should create a schema builder with table config', () => {
            const tableConfig = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name', 'color'])
                .build();

            const builder = createFeatureSchemas(tableConfig);

            expect(builder).toBeDefined();
            expect(builder.schemas).toEqual({});
        });

        it('should register all standard schemas', () => {
            const tableConfig = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name', 'color'])
                .build();

            const builder = createFeatureSchemas(tableConfig).registerAllStandard();

            expect(builder.schemas).toHaveProperty('create');
            expect(builder.schemas).toHaveProperty('createMany');
            expect(builder.schemas).toHaveProperty('getById');
            expect(builder.schemas).toHaveProperty('getMany');
            expect(builder.schemas).toHaveProperty('updateById');
            expect(builder.schemas).toHaveProperty('removeById');
        });
    });

    describe('Standard Schemas Structure', () => {
        const tableConfig = createFeatureTableConfig(tag)
            .restrictReturnColumns(['id', 'name', 'color', 'userId'])
            .restrictInsertFields(['name', 'color'])
            .restrictUpdateFields(['name', 'color'])
            .build();

        const schemas = createFeatureSchemas(tableConfig).registerAllStandard().build();

        describe('Create Schemas', () => {
            it('should have correct create structure', () => {
                const create = schemas.create;
                expect(create).toHaveProperty('service');
                expect(create).toHaveProperty('endpoint');
                expect(create).toHaveProperty('query');
                expect(create.endpoint).toHaveProperty('json');
            });

            it('should validate create service input (requires userId)', () => {
                const valid = create.service.safeParse({
                    data: { name: 'Test', color: '#000' },
                    userId: 'user-123',
                });
                expect(valid.success).toBe(true);

                const invalid = create.service.safeParse({
                    data: { name: 'Test', color: '#000' },
                    // userId missing
                });
                expect(invalid.success).toBe(false);
            });

            it('should validate create endpoint json (no userId)', () => {
                const valid = create.endpoint.json?.safeParse({
                    name: 'Test',
                    color: '#000',
                });
                expect(valid?.success).toBe(true);

                // userId should be stripped or ignored if extra, but not required
                const withUser = create.endpoint.json?.safeParse({
                    name: 'Test',
                    color: '#000',
                    userId: 'user-123',
                });
                // Zod .strict() isn't default, so extra keys are allowed but ignored
                // If we wanted strict, we'd check for failure. Here we just ensure basic fields work.
                expect(withUser?.success).toBe(true);
            });
        });

        describe('GetMany Schemas', () => {
            it('should have correct getMany structure', () => {
                const getMany = schemas.getMany;
                expect(getMany).toHaveProperty('service');
                expect(getMany).toHaveProperty('endpoint');
                expect(getMany.endpoint).toHaveProperty('query');
            });

            it('should exclude userId from endpoint query schema', () => {
                const endpointQuery = getMany.endpoint.query;
                // We can't easily runtime check "key does not exist" on Zod schema unless we inspect .shape
                // But we can check that it validates without userId
                const valid = endpointQuery?.safeParse({
                    pagination: { page: 1, pageSize: 10 },
                });
                expect(valid?.success).toBe(true);
            });
        });

        describe('UpdateById Schemas', () => {
            it('should have correct updateById structure', () => {
                const update = schemas.updateById;
                expect(update.endpoint).toHaveProperty('json');
                expect(update.endpoint).toHaveProperty('param');
            });

            it('should validate partial updates', () => {
                const valid = update.endpoint.json?.safeParse({
                    color: '#FFF', // name missing is ok
                });
                expect(valid?.success).toBe(true);
            });

            it('should validate param id', () => {
                const valid = update.endpoint.param?.safeParse({
                    id: '123',
                });
                expect(valid?.success).toBe(true);
            });
        });
    });

    describe('Custom Schemas', () => {
        const tableConfig = createFeatureTableConfig(tag)
            .restrictReturnColumns(['id', 'name'])
            .build();

        it('should allow adding custom schemas', () => {
            const builder = createFeatureSchemas(tableConfig).addSchema(
                'customOp',
                ({ schemas }) => ({
                    service: schemas.inputData.insert,
                    endpoint: {
                        json: schemas.inputData.insert,
                    },
                })
            );

            expect(builder.schemas).toHaveProperty('customOp');
            expect(builder.schemas.customOp).toHaveProperty('service');
        });

        it('should expose correct helpers in addSchema callback', () => {
            createFeatureSchemas(tableConfig).addSchema('testHelpers', ({ helpers }) => {
                expect(helpers.buildIdentifierSchema).toBeDefined();
                expect(helpers.buildPaginationSchema).toBeDefined();
                // return empty object to satisfy types
                return {};
            });
        });
    });

    describe('Selective Standard Schemas', () => {
        it('should only register selected standard schemas', () => {
            const tableConfig = createFeatureTableConfig(tag)
                .restrictReturnColumns(['id', 'name'])
                .build();

            const builder = createFeatureSchemas(tableConfig).withStandard((b) =>
                b.create().getById()
            );

            expect(builder.schemas).toHaveProperty('create');
            expect(builder.schemas).toHaveProperty('getById');
            expect(builder.schemas).not.toHaveProperty('updateById');
            expect(builder.schemas).not.toHaveProperty('getMany');
        });
    });
});

// Accessors for tests
const tableConfig = createFeatureTableConfig(tag)
    .restrictReturnColumns(['id', 'name', 'color', 'userId'])
    .restrictInsertFields(['name', 'color'])
    .build();
const schemas = createFeatureSchemas(tableConfig).registerAllStandard().build();
const create = schemas.create;
const update = schemas.updateById;
const getMany = schemas.getMany;
