import { bucketSchemas } from '@/features/bucket/schemas';
import { bucketServices } from '@/features/bucket/server/services';
import { routeHandler } from '@/server/lib/route';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

// Create Hono app with proper chaining for RPC type generation
const app = new Hono()
    // Get all buckets for authenticated user
    .get('/', zValidator('query', bucketSchemas.getMany.endpoint.query), async (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) =>
                bucketServices.getMany({
                    pagination: {
                        page: validatedInput.query.page,
                        pageSize: validatedInput.query.pageSize,
                    },
                    filters: validatedInput.query,
                    userId: userId,
                })
            )
    )

    // Get bucket by ID
    .get('/:id', zValidator('param', bucketSchemas.getById.endpoint.param), async (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) =>
                bucketServices.getById({ ids: { id: validatedInput.param.id }, userId: userId })
            )
    )

    // Create a new bucket
    .post('/', zValidator('json', bucketSchemas.create.endpoint.json), async (c) =>
        routeHandler(c)
            .withUser()
            .handleMutation(async ({ userId, validatedInput }) =>
                bucketServices.create({ data: validatedInput.json, userId: userId })
            )
    )

    // Update a bucket
    .patch(
        '/:id',
        zValidator('param', bucketSchemas.updateById.endpoint.param),
        zValidator('json', bucketSchemas.updateById.endpoint.json),
        async (c) =>
            routeHandler(c)
                .withUser()
                .handleMutation(async ({ userId, validatedInput }) =>
                    bucketServices.updateById({
                        ids: { id: validatedInput.param.id },
                        data: validatedInput.json,
                        userId: userId,
                    })
                )
    )

    // Delete a bucket (soft delete)
    .delete('/:id', zValidator('param', bucketSchemas.removeById.endpoint.param), async (c) =>
        routeHandler(c)
            .withUser()
            .handleMutation(async ({ userId, validatedInput }) =>
                bucketServices.removeById({ ids: { id: validatedInput.param.id }, userId: userId })
            )
    );

export default app;
