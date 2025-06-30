import {
    addTagToTransactionSchema,
    createTagSchema,
    updateTagFormSchema,
} from '@/features/tag/schemas';
import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import * as queries from './db/queries';

// Create Hono app with proper chaining for RPC type generation
const app = new Hono()
    // Get all tags for authenticated user
    .get('/', async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            return await queries.getTagsByUserId({ userId: user.id });
        })
    )

    // Get tag by ID
    .get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            const tag = await queries.getTagById({ id });

            if (!tag) {
                throw new Error('Tag not found');
            }

            return tag;
        })
    )

    // Create a new tag
    .post('/', zValidator('json', createTagSchema), async (c) =>
        withRoute(
            c,
            async () => {
                const user = getUser(c);
                const data = c.req.valid('json');
                return await queries.createTag({ data: { ...data, userId: user.id } });
            },
            201
        )
    )

    // Update a tag
    .put(
        '/:id',
        zValidator('param', z.object({ id: z.string() })),
        zValidator('json', updateTagFormSchema),
        async (c) =>
            withRoute(c, async () => {
                const { id } = c.req.valid('param');
                const data = c.req.valid('json');

                const updatedTag = await queries.updateTag({ id, data });

                if (!updatedTag) {
                    throw new Error('Tag not found');
                }

                return updatedTag;
            })
    )

    // Delete a tag (soft delete)
    .delete('/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            await queries.deleteTag({ id });
            return { success: true };
        })
    )

    // Get tags for a transaction with metadata
    .get(
        '/transactions/:transactionId/tags',
        zValidator('param', z.object({ transactionId: z.string() })),
        async (c) =>
            withRoute(c, async () => {
                const { transactionId } = c.req.valid('param');
                return await queries.getTransactionTags({ transactionId });
            })
    )

    // Get simple tags for a transaction
    .get(
        '/transactions/:transactionId/tags/simple',
        zValidator('param', z.object({ transactionId: z.string() })),
        async (c) =>
            withRoute(c, async () => {
                const { transactionId } = c.req.valid('param');
                return await queries.getTagsForTransaction({ transactionId });
            })
    )

    // Add tag to transaction
    .post('/transactions/tags', zValidator('json', addTagToTransactionSchema), async (c) =>
        withRoute(
            c,
            async () => {
                const { transactionId, tagId, source, confidence } = c.req.valid('json');
                return await queries.addTagToTransaction({
                    transactionId,
                    tagId,
                    source,
                    confidence,
                });
            },
            201
        )
    )

    // Remove tag from transaction
    .delete(
        '/transactions/:transactionId/tags/:tagId',
        zValidator('param', z.object({ transactionId: z.string(), tagId: z.string() })),
        async (c) =>
            withRoute(c, async () => {
                const { transactionId, tagId } = c.req.valid('param');
                await queries.removeTagFromTransaction({ transactionId, tagId });
                return { success: true };
            })
    )

    // Update tag transaction count
    .put('/:tagId/update-count', zValidator('param', z.object({ tagId: z.string() })), async (c) =>
        withRoute(c, async () => {
            const { tagId } = c.req.valid('param');
            await queries.updateTagTransactionCount({ tagId });
            return { success: true };
        })
    );

export default app;
