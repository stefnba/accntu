import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import * as queries from './db/queries';

// Create a new Hono app for tag routes
const app = new Hono();

// Validation schemas
const CreateTagSchema = z.object({
    name: z.string().min(1, 'Tag name is required').max(100),
    description: z.string().optional(),
    color: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color')
        .default('#6366f1'),
    icon: z.string().optional(),
    type: z.enum(['category', 'merchant', 'project', 'location', 'custom']).default('custom'),
    parentTagId: z.string().optional(),
    autoTagRules: z.array(z.string()).optional(),
});

const UpdateTagSchema = CreateTagSchema.partial();

const AddTagToTransactionSchema = z.object({
    transactionId: z.string(),
    tagId: z.string(),
    source: z.string().default('manual'),
    confidence: z.string().optional(),
});

// Tag Routes
app.get('/tags', async (c) =>
    withRoute(c, async () => {
        const user = getUser(c);
        return await queries.getTagsByUserId({ userId: user.id });
    })
);

app.get('/tags/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
    withRoute(c, async () => {
        const { id } = c.req.valid('param');
        const tag = await queries.getTagById({ id });

        if (!tag) {
            throw new Error('Tag not found');
        }

        return tag;
    })
);

app.get('/tags/hierarchy', async (c) =>
    withRoute(c, async () => {
        const user = getUser(c);
        return await queries.getTagHierarchy({ userId: user.id });
    })
);

app.get('/tags/root', async (c) =>
    withRoute(c, async () => {
        const user = getUser(c);
        return await queries.getRootTags({ userId: user.id });
    })
);

app.get(
    '/tags/:parentTagId/children',
    zValidator('param', z.object({ parentTagId: z.string() })),
    async (c) =>
        withRoute(c, async () => {
            const { parentTagId } = c.req.valid('param');
            return await queries.getChildTags({ parentTagId });
        })
);

app.get('/tags/auto-rules', async (c) =>
    withRoute(c, async () => {
        const user = getUser(c);
        return await queries.getTagsWithAutoRules({ userId: user.id });
    })
);

app.post('/tags', zValidator('json', CreateTagSchema), async (c) =>
    withRoute(
        c,
        async () => {
            const user = getUser(c);
            const data = c.req.valid('json');
            return await queries.createTag({ data: { ...data, userId: user.id } });
        },
        201
    )
);

app.put(
    '/tags/:id',
    zValidator('param', z.object({ id: z.string() })),
    zValidator('json', UpdateTagSchema),
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
);

app.delete('/tags/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
    withRoute(c, async () => {
        const { id } = c.req.valid('param');
        await queries.deleteTag({ id });
        return { success: true };
    })
);

// Transaction Tag Routes
app.get(
    '/transactions/:transactionId/tags',
    zValidator('param', z.object({ transactionId: z.string() })),
    async (c) =>
        withRoute(c, async () => {
            const { transactionId } = c.req.valid('param');
            return await queries.getTransactionTags({ transactionId });
        })
);

app.get(
    '/transactions/:transactionId/tags/simple',
    zValidator('param', z.object({ transactionId: z.string() })),
    async (c) =>
        withRoute(c, async () => {
            const { transactionId } = c.req.valid('param');
            return await queries.getTagsForTransaction({ transactionId });
        })
);

app.post('/transactions/tags', zValidator('json', AddTagToTransactionSchema), async (c) =>
    withRoute(
        c,
        async () => {
            const { transactionId, tagId, source, confidence } = c.req.valid('json');
            return await queries.addTagToTransaction({ transactionId, tagId, source, confidence });
        },
        201
    )
);

app.delete(
    '/transactions/:transactionId/tags/:tagId',
    zValidator('param', z.object({ transactionId: z.string(), tagId: z.string() })),
    async (c) =>
        withRoute(c, async () => {
            const { transactionId, tagId } = c.req.valid('param');
            await queries.removeTagFromTransaction({ transactionId, tagId });
            return { success: true };
        })
);

// Utility Routes
app.put(
    '/tags/:tagId/update-count',
    zValidator('param', z.object({ tagId: z.string() })),
    async (c) =>
        withRoute(c, async () => {
            const { tagId } = c.req.valid('param');
            await queries.updateTagTransactionCount({ tagId });
            return { success: true };
        })
);

export default app;
