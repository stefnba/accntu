import { createTestUser } from '@/../test/utils/create-user';
import { tag } from '@/features/tag/server/db/tables';
import { createFeatureSchemas } from '@/lib/schema';
import { createFeatureQueries } from '@/server/lib/db/query/feature-queries';
import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import { AppErrors } from '@/server/lib/error';
import { AppError } from '@/server/lib/error/base/error/app-error';
import { beforeAll, describe, expect, it } from 'vitest';
import { createFeatureServices } from '../factory';

describe('Feature Service Builder Integration', () => {
    let testUser: Awaited<ReturnType<typeof createTestUser>>;

    beforeAll(async () => {
        testUser = await createTestUser();
    });

    const createTestConfig = createFeatureTableConfig(tag)
        .setUserId('userId')
        .omitBaseSchema(['transactionCount'])
        .restrictReturnColumns(['id', 'name', 'userId', 'isActive'])
        .restrictInsertFields(['name', 'color']) // added color as it is required in tag table
        .restrictUpdateFields(['name'])
        .build();

    const createTestSchemas = createFeatureSchemas(createTestConfig)
        .addSchema('customQuery', ({ schemas }) => {
            return {
                query: schemas.base.extend({ userId: schemas.userId.shape.userId }),
                service: schemas.base.extend({ userId: schemas.userId.shape.userId }),
            };
        })
        .registerAllStandard()
        .build();

    const createTestQueries = createFeatureQueries('tag-service-test', createTestConfig)
        .registerSchema(createTestSchemas)
        .registerAllStandard()
        .addQuery('customQuery', ({ tableOps, tableConfig }) => ({
            fn: async (input) => {
                // Simple custom query that creates a record
                return tableOps.createRecord({
                    data: { name: input.name, color: '#000000', userId: input.userId },
                    returnColumns: tableConfig.getReturnColumns(),
                });
            },
        }))
        .addQuery('failingQuery', () => ({
            fn: async (_?: unknown) => {
                throw AppErrors.validation('INVALID_INPUT', { message: 'Invalid input' });
            },
        }))
        .addQuery('crashingQuery', () => ({
            fn: async (_?: unknown) => {
                throw new Error('Unexpected error');
            },
        }))
        .build();

    describe('Builder Creation', () => {
        it('should create a service builder with name', () => {
            const builder = createFeatureServices('tag-service-test');
            expect(builder).toBeDefined();
            expect(builder.name).toBe('tag-service-test');
        });

        it('should register real queries and schemas', () => {
            const builder = createFeatureServices('tag-service-test')
                .registerQueries(createTestQueries)
                .registerSchema(createTestSchemas);

            expect(builder.queries).toBeDefined();
            expect(builder.queries).toHaveProperty('create');
            expect(builder.queries).toHaveProperty('customQuery');
            expect(builder.schemas).toBeDefined();
        });
    });

    describe('Custom Services', () => {
        it('should execute custom service with real query', async () => {
            const services = createFeatureServices('tag-service-test')
                .registerQueries(createTestQueries)
                .registerSchema(createTestSchemas)
                .addService('createCustom', ({ queries }) => ({
                    fn: async (input: { name: string }) => {
                        return await queries.customQuery({
                            name: input.name,
                            userId: testUser.id,
                            color: '#000000',
                        });
                    },
                }))
                .build();

            const result = await services.createCustom({ name: 'custom-test-' + Date.now() });

            expect(result).toBeDefined();
            expect(result.name).toContain('custom-test');
            expect(result.userId).toBe(testUser.id);
        });

        it('should access schemas in custom service', async () => {
            const services = createFeatureServices('tag-service-test')
                .registerQueries(createTestQueries)
                .registerSchema(createTestSchemas)
                .addService('validateAndCreate', ({ queries, schemas }) => ({
                    fn: async (input: { name: string }) => {
                        // Use schema to validate (runtime check simulation)
                        const valid = schemas.create.service.parse({
                            data: { name: input.name, color: '#FFFFFF' },
                            userId: testUser.id,
                        });

                        return await queries.create({
                            data: valid.data,
                            userId: valid.userId,
                        });
                    },
                }))
                .build();

            const result = await services.validateAndCreate({ name: 'schema-test-' + Date.now() });
            expect(result.name).toContain('schema-test');
        });
    });

    describe('Standard Services Integration', () => {
        it('should register and execute standard services', async () => {
            const services = createFeatureServices('tag-service-test')
                .registerQueries(createTestQueries)
                .registerSchema(createTestSchemas)
                .registerAllStandard()
                .build();

            // Test Create
            const created = await services.create({
                data: { name: 'std-create-' + Date.now(), color: '#123456' },
                userId: testUser.id,
            });
            expect(created.name).toContain('std-create');

            // Test GetById
            const fetched = await services.getById({
                ids: { id: created.id },
                userId: testUser.id,
            });
            expect(fetched.id).toBe(created.id);

            // Test GetMany
            const list = await services.getMany({ userId: testUser.id });
            expect(list.length).toBeGreaterThan(0);
            expect(list.find((i) => i.id === created.id)).toBeDefined();
        });

        it('should respect selective standard registration', async () => {
            const services = createFeatureServices('tag-service-test')
                .registerQueries(createTestQueries)
                .withStandard((b) => b.create().getById())
                .build();

            expect(services).toHaveProperty('create');
            expect(services).toHaveProperty('getById');
            expect(services).not.toHaveProperty('getMany');
        });
    });

    describe('Error Handling & Null Checks', () => {
        it('should throw NOT_FOUND when getById returns null (throwOnNull: true)', async () => {
            const services = createFeatureServices('tag-service-test')
                .registerQueries(createTestQueries)
                .registerAllStandard()
                .build();

            try {
                await services.getById({
                    ids: { id: 'non-existent' },
                    userId: testUser.id,
                });
                throw new Error('Should have thrown');
            } catch (err) {
                expect(err).toBeInstanceOf(AppError);
                expect((err as AppError).code).toBe('NOT_FOUND');
            }
        });

        it('should throw AppError from failed query', async () => {
            const services = createFeatureServices('tag-service-test')
                .registerQueries(createTestQueries)
                .addService('fail', ({ queries }) => ({
                    fn: async (input?: unknown) => queries.failingQuery(input),
                }))
                .build();

            try {
                await services.fail({});
                throw new Error('Should have thrown');
            } catch (err) {
                expect(err).toBeInstanceOf(AppError);
                expect((err as AppError).code).toBe('INVALID_INPUT');
            }
        });

        it('should wrap unexpected errors', async () => {
            const services = createFeatureServices('tag-service-test')
                .registerQueries(createTestQueries)
                .addService('crash', ({ queries }) => ({
                    fn: async (input?: unknown) => queries.crashingQuery(input),
                }))
                .build();

            try {
                await services.crash({});
                throw new Error('Should have thrown');
            } catch (err) {
                expect(err).toBeInstanceOf(AppError);
                expect((err as AppError).code).toBe('INTERNAL_ERROR');
            }
        });
    });

    describe('Complex Flows', () => {
        it('should handle create -> update -> read flow', async () => {
            const services = createFeatureServices('tag-service-test')
                .registerQueries(createTestQueries)
                .registerAllStandard()
                .build();

            // Create
            const created = await services.create({
                data: { name: 'flow-start-' + Date.now(), color: '#000000' },
                userId: testUser.id,
            });

            // Update
            const updated = await services.updateById({
                ids: { id: created.id },
                data: { name: 'flow-updated' },
                userId: testUser.id,
            });

            expect(updated?.name).toBe('flow-updated');

            // Read
            const fetched = await services.getById({
                ids: { id: created.id },
                userId: testUser.id,
            });

            expect(fetched.name).toBe('flow-updated');
        });
    });
});
