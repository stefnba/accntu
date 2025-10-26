import { labelSchemas } from '@/features/label/schemas';
import { label } from '@/features/label/server/db/tables';
import { db } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';
import { and, asc, eq, ilike, inArray, isNull, max, SQL, sql } from 'drizzle-orm';
export const labelQueries = createFeatureQueries('label')
    .registerSchema(labelSchemas)
    .registerCoreQueries(label, {
        idFields: ['id'],
        userIdField: 'userId',
        queryConfig: {
            getMany: {
                filters: (filters, f) => [f.ilike('name', filters?.search)],
            },
        },
    })
    /**
     * Get all labels for a user in flattened order with global index based on hierarchical structure
     */
    .addQuery('getFlattened', {
        operation: 'get flattened labels with hierarchy',
        fn: async ({ userId, filters }) => {
            const withRecursive = sql`
                WITH RECURSIVE label_hierarchy AS (
                    -- Base case: root labels ordered by index
                    SELECT
                        ${label.id},
                        ${label.userId},
                        ${label.name},
                        ${label.color},
                        ${label.icon},
                        ${label.imageUrl},
                        ${label.parentId},
                        ${label.createdAt},
                        ${label.updatedAt},
                        ${label.isActive},
                        ${label.firstParentId},
                        LPAD(${label.index}::text, 6, '0') as sort_path,
                        ${label.index},
                        0 as depth
                    FROM ${label}
                    WHERE parent_id IS NULL
                        AND ${label.userId} = ${userId}
                        AND ${label.isActive} = true
                        ${filters?.search ? sql`AND ${label.name} ILIKE ${`%${filters.search}%`}` : sql``}

                    UNION ALL

                    -- Recursive case: children ordered by parent's path + their index
                    SELECT
                        ${label.id},
                        ${label.userId},
                        ${label.name},
                        ${label.color},
                        ${label.icon},
                        ${label.imageUrl},
                        ${label.parentId},
                        ${label.createdAt},
                        ${label.updatedAt},
                        ${label.isActive},
                        ${label.firstParentId},
                        h.sort_path || '.' || LPAD(${label.index}::text, 6, '0') as sort_path,
                        ${label.index},
                        h.depth + 1 as depth
                    FROM ${label}
                    JOIN label_hierarchy h ON ${label.parentId} = h.id
                    WHERE ${label.isActive} = true
                        ${filters?.search ? sql`AND ${label.name} ILIKE ${`%${filters.search}%`}` : sql``}
                ),

                -- Add children to root labels and global index
                base_query AS (
                SELECT
                    lh.id,
                    lh.user_id AS "userId",
                    lh.name,
                    lh.color,
                    lh.icon,
                    lh.image_url AS "imageUrl",
                    lh.parent_id AS "parentId",
                    lh.depth,
                    lh.index,
                    lh.created_at AS "createdAt",
                    lh.updated_at AS "updatedAt",
                    lh.is_active AS "isActive",
                    lh.first_parent_id AS "firstParentId",
                    lh.sort_path AS "sortPath",
                    ROW_NUMBER() OVER (ORDER BY lh.sort_path)::integer - 1 AS "globalIndex",
                    (
                        SELECT COUNT(*)::integer
                        FROM ${label}
                        WHERE ${label.parentId} = lh.id
                            AND ${label.isActive} = true
                    ) AS "countChildren",
                    EXISTS(
                        SELECT 1
                        FROM ${label}
                        WHERE ${label.parentId} = lh.id
                            AND ${label.isActive} = true
                    ) AS "hasChildren"
                FROM label_hierarchy lh
            )
            `;

            const query = sql<{
                id: string;
                userId: string;
                name: string;
                color: string;
                icon: string;
                imageUrl: string;
                parentId: string;
                depth: number;
                index: number;
                globalIndex: number;
                countChildren: number;
                hasChildren: boolean;
            }>`
                SELECT * FROM base_query
                ORDER BY "globalIndex"
            `;

            const finalSql: SQL = sql.join([withRecursive, query], sql.raw(' '));

            type FlattenedLabelRow = {
                id: string;
                userId: string;
                name: string;
                color: string;
                icon: string;
                imageUrl: string;
                parentId: string;
                depth: number;
                index: number;
                globalIndex: number;
                countChildren: number;
                hasChildren: boolean;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                firstParentId: string;
                sortPath: string;
            };

            return await db.execute<FlattenedLabelRow>(finalSql);
        },
    })
    /**
     * Get many labels
     */
    .overwriteQuery('getMany', {
        operation: 'get labels with filters',
        fn: async ({ userId, filters, pagination }) => {
            const conditions = [eq(label.userId, userId), eq(label.isActive, true)];

            if (filters?.search) {
                conditions.push(ilike(label.name, `%${filters.search}%`));
            }

            if (filters?.parentId) {
                conditions.push(eq(label.parentId, filters.parentId));
            }

            return await db.query.label.findMany({
                where: and(...conditions),
                with: {
                    parent: true,
                    children: {
                        where: eq(label.isActive, true),
                    },
                },
                orderBy: [asc(label.index), asc(label.name)],
                limit: pagination?.pageSize || 20,
                offset: ((pagination?.page || 1) - 1) * (pagination?.pageSize || 20),
            });
        },
    })
    /**
     * Bulk update label orders and parents for drag and drop operations
     */
    .addQuery('reorder', {
        operation: 'bulk reorder labels',
        fn: async ({ items, userId }) => {
            // If no items, return early
            if (items.length === 0) return { success: true, updatedCount: 0 };

            // Build both CASE statements in a single loop for efficiency
            const indexCases: SQL[] = [];
            const parentCases: SQL[] = [];
            const ids: string[] = [];

            // add index and parentId to cases
            items.forEach((item) => {
                ids.push(item.id);
                indexCases.push(sql` when ${label.id} = ${item.id} then ${item.index}::integer`);

                if (item.parentId) {
                    parentCases.push(sql` when ${label.id} = ${item.id} then ${item.parentId}`);
                } else {
                    parentCases.push(sql` when ${label.id} = ${item.id} then null`);
                }
            });

            const indexCaseStatement = sql.join([sql`(case`, ...indexCases, sql` end)`], sql``);
            const parentCaseStatement = sql.join([sql`(case`, ...parentCases, sql` end)`], sql``);

            // Execute the bulk update with userId filter
            await db
                .update(label)
                .set({
                    index: indexCaseStatement,
                    parentId: parentCaseStatement,
                    updatedAt: new Date(),
                })
                .where(
                    and(inArray(label.id, ids), eq(label.userId, userId), eq(label.isActive, true))
                );

            return { success: true, updatedCount: items.length };
        },
    })
    /**
     * Get a specific label by ID for a user
     */
    .overwriteQuery('getById', {
        operation: 'get label by ID',
        fn: async ({ ids, userId }) => {
            const result = await db.query.label.findFirst({
                where: and(
                    eq(label.id, ids.id),
                    eq(label.userId, userId),
                    eq(label.isActive, true)
                ),
                with: {
                    parent: true,
                    children: {
                        where: eq(label.isActive, true),
                    },
                },
            });

            return result || null;
        },
    })
    .addQuery('getMaxIndex', {
        operation: 'get max index for a parent',
        fn: async ({ parentId, userId }) => {
            const result = await db
                .select({ maxSort: max(label.index) })
                .from(label)
                .where(
                    and(
                        eq(label.userId, userId),
                        eq(label.isActive, true),
                        parentId ? eq(label.parentId, parentId) : isNull(label.parentId)
                    )
                );
            return result;
        },
    });

export type TLabel = InferFeatureType<typeof labelQueries>;
