import { createTestUser } from '@/../test/utils';
import { tagSchemas, tagToTransactionSchemas } from '@/features/tag/schemas';
import { tagQueries, tagToTransactionQueries } from '@/features/tag/server/db/queries';
import { createFeatureServices } from '@/server/lib/service/builder/factory';
import { beforeAll, describe, expect, it } from 'vitest';

describe('Custom Services', () => {
    let testUser: Awaited<ReturnType<typeof createTestUser>>;

    beforeAll(async () => {
        testUser = await createTestUser();
    });

    describe('Adding Custom Services', () => {
        it('should add custom service to builder', () => {
            const services = createFeatureServices('tag')
                .registerSchemas(tagSchemas)
                .registerQueries(tagQueries)
                .registerCoreServices()
                .addService('customOperation', () => ({
                    operation: 'custom operation',
                    throwOnNull: false,
                    fn: async () => {
                        return { custom: true };
                    },
                }))
                .build();

            expect(services).toHaveProperty('customOperation');
            expect(typeof services.customOperation).toBe('function');
        });

        it('should execute custom service', async () => {
            const services = createFeatureServices('tag')
                .registerSchemas(tagSchemas)
                .registerQueries(tagQueries)
                .registerCoreServices()
                .addService('countUserTags', ({ queries }) => ({
                    operation: 'count user tags',
                    throwOnNull: false,
                    fn: async (input: { userId: string }) => {
                        const result = await queries.getMany({
                            filters: {},
                            pagination: { page: 1, pageSize: 1000 },
                            userId: input.userId,
                        });
                        return result.length;
                    },
                }))
                .build();

            const count = await services.countUserTags({ userId: testUser.id });

            expect(typeof count).toBe('number');
            expect(count).toBeGreaterThanOrEqual(0);
        });

        it('should chain multiple custom services', () => {
            const services = createFeatureServices('tag')
                .registerSchemas(tagSchemas)
                .registerQueries(tagQueries)
                .registerCoreServices()
                .addService('customOne', () => ({
                    operation: 'custom one',
                    throwOnNull: false,
                    fn: async () => ({ one: true }),
                }))
                .addService('customTwo', () => ({
                    operation: 'custom two',
                    throwOnNull: false,
                    fn: async () => ({ two: true }),
                }))
                .build();

            expect(services).toHaveProperty('customOne');
            expect(services).toHaveProperty('customTwo');
            expect(services).toHaveProperty('getById');
            expect(services).toHaveProperty('create');
        });

        it('should execute multiple chained custom services', async () => {
            const services = createFeatureServices('tag')
                .registerSchemas(tagSchemas)
                .registerQueries(tagQueries)
                .registerCoreServices()
                .addService('customOne', () => ({
                    operation: 'custom one',
                    throwOnNull: false,
                    fn: async (input: { userId: string }) => ({ one: true, userId: input.userId }),
                }))
                .addService('customTwo', () => ({
                    operation: 'custom two',
                    throwOnNull: false,
                    fn: async (input: { userId: string }) => ({ two: true, userId: input.userId }),
                }))
                .build();

            const resultOne = await services.customOne({ userId: testUser.id });
            const resultTwo = await services.customTwo({ userId: testUser.id });

            expect(resultOne).toHaveProperty('one', true);
            expect(resultTwo).toHaveProperty('two', true);
        });
    });

    describe('Custom Services with Queries', () => {
        it('should access queries in custom service', async () => {
            const services = createFeatureServices('tag')
                .registerSchemas(tagSchemas)
                .registerQueries(tagQueries)
                .registerCoreServices()
                .addService('getActiveTagsCount', ({ queries }) => ({
                    operation: 'get active tags count',
                    throwOnNull: false,
                    fn: async (input: { userId: string }) => {
                        const result = await queries.getMany({
                            filters: {},
                            pagination: { page: 1, pageSize: 1000 },
                            userId: input.userId,
                        });
                        return result.filter((tag) => tag.isActive).length;
                    },
                }))
                .build();

            // Create some tags first
            await services.create({
                data: { name: 'active-tag-' + Date.now(), color: '#AAAAAA' },
                userId: testUser.id,
            });

            const count = await services.getActiveTagsCount({ userId: testUser.id });

            expect(typeof count).toBe('number');
            expect(count).toBeGreaterThan(0);
        });

        it('should access other services in custom service', async () => {
            const services = createFeatureServices('tag')
                .registerSchemas(tagSchemas)
                .registerQueries(tagQueries)
                .registerCoreServices()
                .addService('createAndCount', ({ services }) => ({
                    operation: 'create and count',
                    throwOnNull: false,
                    fn: async (input: {
                        data: { name: string; color: string };
                        userId: string;
                    }) => {
                        await services.create({ data: input.data, userId: input.userId });
                        const result = await services.getMany({
                            filters: {},
                            pagination: { page: 1, pageSize: 1000 },
                            userId: input.userId,
                        });
                        return result.length;
                    },
                }))
                .build();

            const initialCount = await services.createAndCount({
                data: { name: 'count-test-' + Date.now(), color: '#BBBBBB' },
                userId: testUser.id,
            });

            expect(typeof initialCount).toBe('number');
            expect(initialCount).toBeGreaterThan(0);
        });
    });

    describe('Custom Services with Multiple Query Sources', () => {
        it('should register and use multiple query sources', async () => {
            const services = createFeatureServices('tag')
                .registerSchemas(tagSchemas)
                .registerSchemas(tagToTransactionSchemas)
                .registerQueries(tagQueries)
                .registerQueries(tagToTransactionQueries)
                .registerCoreServices()
                .build();

            expect(services).toHaveProperty('getById');
            expect(services).toHaveProperty('create');

            // Test that core services work
            const tag = await services.create({
                data: { name: 'multi-query-test-' + Date.now(), color: '#CCCCCC' },
                userId: testUser.id,
            });

            expect(tag).toHaveProperty('id');
        });

        it('should access queries from multiple sources in custom service', () => {
            const services = createFeatureServices('tag')
                .registerSchemas(tagSchemas)
                .registerSchemas(tagToTransactionSchemas)
                .registerQueries(tagQueries)
                .registerQueries(tagToTransactionQueries)
                .registerCoreServices()
                .addService('complexOperation', ({ queries }) => ({
                    operation: 'complex operation',
                    throwOnNull: false,
                    fn: async (input: { userId: string }) => {
                        // Just verify queries are available
                        expect(queries).toHaveProperty('getMany');
                        expect(queries).toHaveProperty('assignToTransaction');
                        return { success: true, userId: input.userId };
                    },
                }))
                .build();

            expect(services).toHaveProperty('complexOperation');
        });
    });

    describe('Custom Service Error Handling', () => {
        it('should throw error when custom service throwOnNull is true and result is null', async () => {
            const services = createFeatureServices('tag')
                .registerSchemas(tagSchemas)
                .registerQueries(tagQueries)
                .registerCoreServices()
                .addService('throwingService', () => ({
                    operation: 'throwing service',
                    throwOnNull: true,
                    fn: async (_input: { userId: string }) => {
                        return null;
                    },
                }))
                .build();

            await expect(services.throwingService({ userId: testUser.id })).rejects.toThrow();
        });

        it('should return null when custom service throwOnNull is false and result is null', async () => {
            const services = createFeatureServices('tag')
                .registerSchemas(tagSchemas)
                .registerQueries(tagQueries)
                .registerCoreServices()
                .addService('nonThrowingService', () => ({
                    operation: 'non throwing service',
                    throwOnNull: false,
                    fn: async (_input: { userId: string }) => {
                        return null;
                    },
                }))
                .build();

            const result = await services.nonThrowingService({ userId: testUser.id });

            expect(result).toBeNull();
        });

        it('should propagate errors from custom service', async () => {
            const services = createFeatureServices('tag')
                .registerSchemas(tagSchemas)
                .registerQueries(tagQueries)
                .registerCoreServices()
                .addService('errorService', () => ({
                    operation: 'error service',
                    throwOnNull: false,
                    fn: async (_input: { userId: string }) => {
                        throw new Error('Custom service error');
                    },
                }))
                .build();

            await expect(services.errorService({ userId: testUser.id })).rejects.toThrow(
                'Custom service error'
            );
        });
    });

    describe('Custom Service Type Safety', () => {
        it('should provide type-safe access to queries and services', () => {
            const services = createFeatureServices('tag')
                .registerSchemas(tagSchemas)
                .registerQueries(tagQueries)
                .registerCoreServices()
                .addService('typeSafeService', ({ queries, services }) => ({
                    operation: 'type safe service',
                    throwOnNull: false,
                    fn: async (input: { userId: string }) => {
                        // TypeScript should provide autocompletion for these
                        expect(queries).toBeDefined();
                        expect(services).toBeDefined();
                        expect(typeof queries.getMany).toBe('function');
                        expect(typeof services.getById).toBe('function');
                        return { success: true, userId: input.userId };
                    },
                }))
                .build();

            expect(services).toHaveProperty('typeSafeService');
        });
    });

    describe('Custom Service Integration', () => {
        it('should integrate custom service with core CRUD operations', async () => {
            const services = createFeatureServices('tag')
                .registerSchemas(tagSchemas)
                .registerQueries(tagQueries)
                .registerCoreServices()
                .addService('createWithPrefix', ({ services }) => ({
                    operation: 'create with prefix',
                    throwOnNull: true,
                    fn: async (input: { name: string; color: string; userId: string }) => {
                        return await services.create({
                            data: {
                                name: `prefix-${input.name}`,
                                color: input.color,
                            },
                            userId: input.userId,
                        });
                    },
                }))
                .build();

            const result = await services.createWithPrefix({
                name: 'test-' + Date.now(),
                color: '#DDDDDD',
                userId: testUser.id,
            });

            expect(result.name).toContain('prefix-');
            expect(result.color).toBe('#DDDDDD');
        });

        it('should combine multiple operations in custom service', async () => {
            const services = createFeatureServices('tag')
                .registerSchemas(tagSchemas)
                .registerQueries(tagQueries)
                .registerCoreServices()
                .addService('createUpdateAndGet', ({ services }) => ({
                    operation: 'create update and get',
                    throwOnNull: true,
                    fn: async (input: { name: string; color: string; userId: string }) => {
                        // Create
                        const created = await services.create({
                            data: { name: input.name, color: input.color },
                            userId: input.userId,
                        });

                        // Update
                        const updated = await services.updateById({
                            ids: { id: created.id },
                            data: { name: `${input.name}-updated` },
                            userId: input.userId,
                        });

                        // Get
                        const fetched = await services.getById({
                            ids: { id: updated.id },
                            userId: input.userId,
                        });

                        return fetched;
                    },
                }))
                .build();

            const result = await services.createUpdateAndGet({
                name: 'combine-ops-' + Date.now(),
                color: '#EEEEEE',
                userId: testUser.id,
            });

            expect(result.name).toContain('-updated');
        });
    });
});
