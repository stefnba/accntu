import { db } from '@/db/client';
import { getUser } from '@/server/auth/validate';
import { InsertLabelSchema, label } from '@db/schema';
import { zValidator } from '@hono/zod-validator';
import { createLabel } from '@server/services/label';
import { and, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { level } from 'winston';
import { z } from 'zod';

const app = new Hono()
    .get(
        '/',
        zValidator(
            'query',
            z.object({
                level: z.coerce.number().optional(),
                parentId: z.string().optional()
            })
        ),
        async (c) => {
            const { level, parentId } = c.req.valid('query');
            const user = getUser(c);

            console.log(level);

            const data = await db.query.label.findMany({
                where: (fields, { eq, and }) =>
                    and(
                        eq(fields.userId, user.id),
                        level === undefined
                            ? undefined
                            : eq(fields.level, level),
                        !!parentId ? eq(fields.parentId, parentId) : undefined
                    ),
                with: {
                    parentLabel: true,
                    childLabels: true
                },
                orderBy: (fields, { asc }) => asc(fields.rank)
            });
            return c.json(data);
        }
    )
    .patch(
        '/:id',
        zValidator(
            'json',
            InsertLabelSchema.pick({
                name: true,
                parentId: true,
                description: true,
                color: true
            })
        ),
        zValidator(
            'param',
            z.object({
                id: z.string()
            })
        ),
        async (c) => {
            const { id } = c.req.valid('param');
            const values = c.req.valid('json');
            const user = getUser(c);

            const data = await db
                .update(label)
                .set(values)
                .where(and(eq(label.id, id), eq(label.userId, user.id)))
                .returning();

            return c.json(data, 201);
        }
    )
    .post(
        '/create',
        zValidator(
            'json',
            InsertLabelSchema.pick({
                name: true,
                parentId: true,
                description: true,
                color: true
            })
        ),
        async (c) => {
            const values = c.req.valid('json');
            const user = getUser(c);

            console.log({ values });
            try {
                const data = await createLabel(values, user.id);
                return c.json(data, 201);
            } catch (e) {
                console.error(e);
            }
        }
    )
    .delete(
        '/:id',
        zValidator('param', z.object({ id: z.string() })),
        async (c) => {
            const { id } = c.req.valid('param');
            const user = getUser(c);

            const [data] = await db
                .delete(label)
                .where(and(eq(label.id, id), eq(label.userId, user.id)))
                .returning({ id: label.id });

            return c.json(data, 201);
        }
    )
    .get(
        '/:id',
        zValidator(
            'param',
            z.object({
                id: z.string()
            })
        ),
        async (c) => {
            const { id } = c.req.valid('param');
            const user = getUser(c);

            const data = await db.query.label.findFirst({
                where: (fields, { and, eq }) =>
                    and(eq(fields.id, id), eq(fields.userId, user.id)),
                with: {
                    parentLabel: true,
                    childLabels: true
                }
            });

            if (!data) {
                return c.json({ error: 'Not Found' }, 404);
            }

            return c.json(data);
        }
    );

export default app;
