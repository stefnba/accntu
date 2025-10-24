import { createTestUser } from '@/../test/utils';
import { tagSchemas } from '@/features/tag/schemas';
import { tagQueries } from '@/features/tag/server/db/queries';
import { createFeatureServices } from '@/server/lib/service/builder/factory';
import { beforeAll, describe, expect, it } from 'vitest';

describe('ServiceBuilderFactory', () => {
    let testUser: Awaited<ReturnType<typeof createTestUser>>;
    let services: ReturnType<typeof createTestServices>;

    const createTestServices = () =>
        createFeatureServices('tag')
            .registerSchemas(tagSchemas)
            .registerQueries(tagQueries)
            .registerCoreServices()
            .build();

    beforeAll(async () => {
        testUser = await createTestUser();
        services = createTestServices();
    });

    describe('Core CRUD Services', () => {

        it('should create a new tag', async () => {
            const result = await services.create({
                data: {
                    name: 'test-tag-' + Date.now(),
                    color: '#FF0000',
                },
                userId: testUser.id,
            });

            expect(result).toHaveProperty('id');
            expect(result.name).toContain('test-tag-');
            expect(result.color).toBe('#FF0000');
            expect(result.userId).toBe(testUser.id);
        });

        it('should retrieve tag by id', async () => {
            // Create a tag first
            const created = await services.create({
                data: {
                    name: 'find-me-' + Date.now(),
                    color: '#00FF00',
                },
                userId: testUser.id,
            });

            // Now retrieve it
            const result = await services.getById({
                ids: { id: created.id },
                userId: testUser.id,
            });

            expect(result.id).toBe(created.id);
            expect(result.name).toBe(created.name);
        });

        it('should throw when retrieving non-existent tag', async () => {
            await expect(
                services.getById({
                    ids: { id: 'non-existent-id' },
                    userId: testUser.id,
                })
            ).rejects.toThrow();
        });

        it('should update tag by id', async () => {
            const created = await services.create({
                data: {
                    name: 'before-update',
                    color: '#0000FF',
                },
                userId: testUser.id,
            });

            const updated = await services.updateById({
                ids: { id: created.id },
                data: { name: 'after-update' },
                userId: testUser.id,
            });

            expect(updated.name).toBe('after-update');
            expect(updated.id).toBe(created.id);
        });

        it('should remove tag by id', async () => {
            const created = await services.create({
                data: {
                    name: 'to-be-deleted',
                    color: '#FFFFFF',
                },
                userId: testUser.id,
            });

            await services.removeById({
                ids: { id: created.id },
                userId: testUser.id,
            });

            // Verify it's deleted
            await expect(
                services.getById({
                    ids: { id: created.id },
                    userId: testUser.id,
                })
            ).rejects.toThrow();
        });

        it('should get many tags with pagination', async () => {
            // Create multiple tags
            await Promise.all([
                services.create({
                    data: { name: 'tag-1-' + Date.now(), color: '#111111' },
                    userId: testUser.id,
                }),
                services.create({
                    data: { name: 'tag-2-' + Date.now(), color: '#222222' },
                    userId: testUser.id,
                }),
            ]);

            const result = await services.getMany({
                filters: {},
                pagination: { page: 1, pageSize: 10 },
                userId: testUser.id,
            });

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });

        it('should filter tags by search query', async () => {
            const uniqueName = 'unique-search-test-' + Date.now();

            await services.create({
                data: { name: uniqueName, color: '#AAAAAA' },
                userId: testUser.id,
            });

            const result = await services.getMany({
                filters: { search: uniqueName },
                pagination: { page: 1, pageSize: 10 },
                userId: testUser.id,
            });

            expect(result.length).toBeGreaterThan(0);
            expect(result.some((tag: { name: string }) => tag.name === uniqueName)).toBe(true);
        });

        it('should create multiple tags with createMany', async () => {
            const result = await services.createMany({
                data: [
                    { name: 'bulk-tag-1-' + Date.now(), color: '#EEEEEE' },
                    { name: 'bulk-tag-2-' + Date.now(), color: '#DDDDDD' },
                ],
                userId: testUser.id,
            });

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(2);
            expect(result[0]).toHaveProperty('id');
            expect(result[1]).toHaveProperty('id');
            expect(result[0].userId).toBe(testUser.id);
            expect(result[1].userId).toBe(testUser.id);
        });
    });

    describe('Schema Registration', () => {
        it('should merge multiple schema registrations', () => {
            const builder = createFeatureServices('test')
                .registerSchemas(tagSchemas)
                .registerSchemas(tagSchemas);

            expect(builder.schemas).toBeDefined();
            expect(Object.keys(builder.schemas).length).toBeGreaterThan(0);
        });
    });

    describe('Query Registration', () => {
        it('should merge multiple query registrations', () => {
            const builder = createFeatureServices('test')
                .registerQueries(tagQueries)
                .registerQueries(tagQueries);

            expect(builder.queries).toBeDefined();
            expect(Object.keys(builder.queries).length).toBeGreaterThan(0);
        });
    });

    describe('Builder Configuration', () => {
        it('should set and preserve name through the builder chain', () => {
            const builder = createFeatureServices('my-resource')
                .registerSchemas(tagSchemas)
                .registerQueries(tagQueries);

            expect(builder.name).toBe('my-resource');
        });

        it('should build services without errors', () => {
            const services = createFeatureServices('tag')
                .registerSchemas(tagSchemas)
                .registerQueries(tagQueries)
                .registerCoreServices()
                .build();

            expect(services).toHaveProperty('getById');
            expect(services).toHaveProperty('create');
            expect(services).toHaveProperty('createMany');
            expect(services).toHaveProperty('getMany');
            expect(services).toHaveProperty('updateById');
            expect(services).toHaveProperty('removeById');
        });
    });

    describe('Error Handling', () => {
        it('should throw error when updating non-existent tag', async () => {
            await expect(
                services.updateById({
                    ids: { id: 'non-existent-id' },
                    data: { name: 'updated' },
                    userId: testUser.id,
                })
            ).rejects.toThrow();
        });

        it('should throw error when removing non-existent tag', async () => {
            await expect(
                services.removeById({
                    ids: { id: 'non-existent-id' },
                    userId: testUser.id,
                })
            ).rejects.toThrow();
        });
    });

    describe('Type Safety', () => {
        it('should enforce correct input types', async () => {
            // Valid input should work
            const result = await services.create({
                data: {
                    name: 'type-test',
                    color: '#ABCDEF',
                },
                userId: testUser.id,
            });

            expect(result).toBeDefined();
        });
    });
});
