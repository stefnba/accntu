import { createLabel } from '@/server/actions/label';
import { db } from '@db';
import { InsertLabelSchema, label } from '@db/schema';
import { getUser } from '@features/auth/server/hono';
import { zValidator } from '@hono/zod-validator';
import { and, eq, sql } from 'drizzle-orm';
import { getTableColumns } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
    .get('/all', async (c) => {
        const user = getUser(c);

        const parentLabel = alias(label, 'parentLabel');
        const rootParent = alias(label, 'rootParent');

        // {
        //     ...getTableColumns(label),
        //     parentLabel: {
        //         ...getTableColumns(parentLabel)
        //     },
        //     rootParent: {
        //         ...getTableColumns(rootParent)
        //     },
        //     childLabels: sql`label_childLabels`
        // // }

        const data = await db
            .select({
                id: label.id,
                name: label.name,
                description: label.description,
                color: label.color,
                level: label.level,
                rank: label.rank,
                parentLabel: {
                    id: parentLabel.id,
                    name: parentLabel.name,
                    description: parentLabel.description,
                    color: parentLabel.color,
                    level: parentLabel.level,
                    rank: parentLabel.rank
                },
                rootParent: {
                    id: rootParent.id,
                    name: rootParent.name,
                    description: rootParent.description,
                    color: rootParent.color,
                    level: rootParent.level,
                    rank: rootParent.rank
                }
            })
            .from(label)
            .leftJoin(parentLabel, eq(label.parentId, parentLabel.id))
            .leftJoin(rootParent, eq(label.firstParentId, rootParent.id))
            .where(and(eq(label.userId, user.id)))
            .orderBy(
                sql`COALESCE(${rootParent.rank}::varchar, '') || COALESCE(${parentLabel.rank}::varchar, '') || COALESCE(${label.rank}::varchar, ''), ${label.level}`
            );

        return c.json(data);
    })
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

            const data = await db.query.label.findMany({
                columns: {
                    id: true,
                    name: true,
                    description: true,
                    color: true,
                    level: true,
                    rank: true
                },
                where: (fields, { eq, and }) =>
                    and(
                        eq(fields.userId, user.id),
                        level === undefined
                            ? undefined
                            : eq(fields.level, level),
                        !!parentId ? eq(fields.parentId, parentId) : undefined
                    ),
                with: {
                    parentLabel: {
                        columns: {
                            id: true,
                            name: true,
                            description: true,
                            color: true,
                            level: true,
                            rank: true
                        }
                    },
                    childLabels: {
                        columns: {
                            id: true,
                            name: true,
                            description: true,
                            color: true,
                            level: true,
                            rank: true
                        }
                    }
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

            try {
                const data = await createLabel(values, user.id);
                return c.json(data, 201);
            } catch (e) {
                console.error(e);
                return c.json({ error: 'Failed to create label' }, 400);
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
