import { tagSchemas, tagToTransactionSchemas } from '@/features/tag/schemas';
import { tagServices } from '@/features/tag/server/services';
import { routeHandler } from '@/server/lib/route';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';

// Create Hono app with proper chaining for RPC type generation
const app = new Hono()

    // Get all tags
    .get('/', zValidator('query', tagSchemas.getMany.endpoint.query), async (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput: { query } }) =>
                tagServices.getMany({
                    pagination: {
                        page: query?.pagination?.page,
                        pageSize: query?.pagination?.pageSize,
                    },
                    filters: query?.filters,
                    userId: userId,
                })
            )
    )

    // Get tag by ID
    .get('/:id', zValidator('param', tagSchemas.getById.endpoint.param), async (c) =>
        routeHandler(c)
            .withUser()
            .handle(async ({ userId, validatedInput }) =>
                tagServices.getById({ ids: { id: validatedInput.param.id }, userId: userId })
            )
    )

    // Create a new tag
    .post('/', zValidator('json', tagSchemas.create.endpoint.json), async (c) =>
        routeHandler(c)
            .withUser()
            .handleMutation(async ({ validatedInput, userId }) =>
                tagServices.create({ data: validatedInput.json, userId })
            )
    )

    // Update a tag
    .patch(
        '/:id',
        zValidator('param', tagSchemas.updateById.endpoint.param),
        zValidator('json', tagSchemas.updateById.endpoint.json),
        async (c) =>
            routeHandler(c)
                .withUser()
                .handle(async ({ userId, validatedInput }) =>
                    tagServices.updateById({
                        ids: { id: validatedInput.param.id },
                        data: validatedInput.json,
                        userId: userId,
                    })
                )
    )

    // Delete a tag (soft delete)
    .delete('/:id', zValidator('param', tagSchemas.removeById.endpoint.param), async (c) =>
        routeHandler(c)
            .withUser()
            .handleMutation(async ({ userId, validatedInput }) =>
                tagServices.removeById({ ids: { id: validatedInput.param.id }, userId: userId })
            )
    )

    // Assign tags to a transaction
    .put(
        '/assign/:transactionId',
        zValidator('param', tagToTransactionSchemas.assign.endpoint.param),
        zValidator('json', tagToTransactionSchemas.assign.endpoint.json),
        async (c) =>
            routeHandler(c)
                .withUser()
                .handleMutation(async ({ userId, validatedInput }) =>
                    tagServices.assign({
                        transactionId: validatedInput.param.transactionId,
                        userId: userId,
                        tagIds: validatedInput.json.tagIds,
                    })
                )
    );

export default app;
