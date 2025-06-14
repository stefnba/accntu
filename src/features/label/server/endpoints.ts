import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { validateLabelHierarchy } from '../utils';
import * as queries from './db/queries';

// Create a new Hono app for label routes
const app = new Hono();

// Validation schemas
const CreateLabelSchema = z.object({
    name: z.string().min(1, 'Label name is required').max(100),
    description: z.string().optional(),
    color: z.string().optional(),
    rank: z.number().int().min(0).default(0),
    level: z.number().int().min(0).default(0),
    parentId: z.string().optional(),
    firstParentId: z.string().optional(),
});

const UpdateLabelSchema = CreateLabelSchema.partial();

// Label Routes
app.get('/labels', async (c) =>
    withRoute(c, async () => {
        const user = getUser(c);
        return await queries.getLabelsByUserId({ userId: user.id });
    })
);

app.get('/labels/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
    withRoute(c, async () => {
        const { id } = c.req.valid('param');
        const label = await queries.getLabelById({ id });

        if (!label) {
            throw new Error('Label not found');
        }

        return label;
    })
);

app.get('/labels/hierarchy', async (c) =>
    withRoute(c, async () => {
        const user = getUser(c);
        return await queries.getLabelHierarchy({ userId: user.id });
    })
);

app.get('/labels/root', async (c) =>
    withRoute(c, async () => {
        const user = getUser(c);
        return await queries.getRootLabels({ userId: user.id });
    })
);

app.get(
    '/labels/:parentId/children',
    zValidator('param', z.object({ parentId: z.string() })),
    async (c) =>
        withRoute(c, async () => {
            const { parentId } = c.req.valid('param');
            return await queries.getChildLabels({ parentId });
        })
);

app.post('/labels', zValidator('json', CreateLabelSchema), async (c) =>
    withRoute(
        c,
        async () => {
            const user = getUser(c);
            const data = c.req.valid('json');

            // Validate hierarchy if parent is specified
            if (data.parentId) {
                const allLabels = await queries.getLabelsByUserId({ userId: user.id });
                const error = validateLabelHierarchy(data.parentId, '', allLabels);
                if (error) {
                    throw new Error(error);
                }
            }

            return await queries.createLabel({
                ...data,
                userId: user.id,
                isDeleted: false,
            });
        },
        201
    )
);

app.put(
    '/labels/:id',
    zValidator('param', z.object({ id: z.string() })),
    zValidator('json', UpdateLabelSchema),
    async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            const data = c.req.valid('json');

            // Validate hierarchy if parent is being changed
            if (data.parentId) {
                const user = getUser(c);
                const allLabels = await queries.getLabelsByUserId({ userId: user.id });
                const error = validateLabelHierarchy(data.parentId, id, allLabels);
                if (error) {
                    throw new Error(error);
                }
            }

            const updatedLabel = await queries.updateLabel({ id, data });

            if (!updatedLabel) {
                throw new Error('Label not found');
            }

            return updatedLabel;
        })
);

app.delete('/labels/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
    withRoute(c, async () => {
        const { id } = c.req.valid('param');
        await queries.deleteLabel({ id });
        return { success: true };
    })
);

export default app;
