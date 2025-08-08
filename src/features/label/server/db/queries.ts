import { labelQuerySchemas, TLabelQuery } from '@/features/label/schemas';
import { label } from '@/features/label/server/db/schema';
import type {
    TQueryDeleteUserRecord,
    TQueryInsertUserRecord,
    TQuerySelectUserRecords,
    TQueryUpdateUserRecord,
} from '@/lib/schemas';
import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';
import { and, asc, eq, ilike, isNull, max, SQL, sql } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Get all labels for a user with parent/child relationships
 * @param userId - The user ID to fetch labels for
 * @returns Promise resolving to array of labels with relationships
 */
const getAll = async ({ userId, filters }: TQuerySelectUserRecords<TLabelQuery['filter']>) =>
    withDbQuery({
        operation: 'Get all labels for user',
        queryFn: async () => {
            const where = [eq(label.userId, userId), eq(label.isActive, true)];

            if (filters?.search) {
                where.push(ilike(label.name, `%${filters.search}%`));
            }

            return await db.query.label.findMany({
                where: and(...where),
                with: {
                    parent: true,
                    children: {
                        where: eq(label.isActive, true),
                    },
                },
                orderBy: [asc(label.index), asc(label.name)],
            });
        },
    });

/**
 * Get root labels (no parent) with nested children for a user
 * @param userId - The user ID to fetch labels for
 * @returns Promise resolving to array of root labels with nested children
 */
const getRootLabels = async (userId: string) =>
    withDbQuery({
        operation: 'Get root labels for user',
        queryFn: async () => {
            return await db.query.label.findMany({
                where: and(
                    eq(label.userId, userId),
                    eq(label.isActive, true),
                    isNull(label.parentId)
                ),
                with: {
                    children: {
                        where: eq(label.isActive, true),
                        with: {
                            children: {
                                where: eq(label.isActive, true),
                            },
                        },
                    },
                },
                orderBy: [asc(label.index), asc(label.name)],
            });
        },
    });

/**
 * Get a specific label by ID for a user
 * @param id - The label ID to fetch
 * @param userId - The user ID that owns the label
 * @returns Promise resolving to the label or null if not found
 */
const getById = async (id: string, userId: string) =>
    withDbQuery({
        operation: 'Get label by ID',
        queryFn: async () => {
            return await db.query.label.findFirst({
                where: and(eq(label.id, id), eq(label.userId, userId), eq(label.isActive, true)),
                with: {
                    parent: true,
                    children: {
                        where: eq(label.isActive, true),
                    },
                },
            });
        },
    });

/**
 * Create a new label in the database
 * @param data - The label data including name, color, parentId, etc.
 * @param userId - The user ID that will own the label
 * @returns Promise resolving to the created label record
 */
const create = async ({ data, userId }: TQueryInsertUserRecord<TLabelQuery['insert']>) =>
    withDbQuery({
        operation: 'Create new label',
        queryFn: async () => {
            // Get next index for this parent level
            const parentId = data.parentId ?? null;
            const maxindexResult = await db
                .select({ maxSort: max(label.index) })
                .from(label)
                .where(
                    and(
                        eq(label.userId, userId),
                        eq(label.isActive, true),
                        parentId ? eq(label.parentId, parentId) : isNull(label.parentId)
                    )
                );

            const nextindex = (maxindexResult[0]?.maxSort ?? -1) + 1;

            const [labelRecord] = await db
                .insert(label)
                .values({
                    ...data,
                    userId,
                    index: nextindex,
                })
                .returning();

            return labelRecord;
        },
    });

/**
 * Update an existing label in the database
 * @param id - The label ID to update
 * @param data - The updated label data
 * @param userId - The user ID that owns the label
 * @returns Promise resolving to the updated label record
 */
const update = async ({ id, data, userId }: TQueryUpdateUserRecord<TLabelQuery['update']>) =>
    withDbQuery({
        operation: 'Update label',
        queryFn: async () => {
            console.log('update', id, data, userId);

            const [labelRecord] = await db
                .update(label)
                .set({
                    ...data,
                    updatedAt: new Date(),
                })
                .where(and(eq(label.id, id), eq(label.userId, userId)))
                .returning();

            return labelRecord;
        },
    });

/**
 * Soft delete a label by setting isActive to false
 * @param id - The label ID to delete
 * @param userId - The user ID that owns the label
 * @returns Promise resolving to the deleted label record
 */
const remove = async ({ id, userId }: TQueryDeleteUserRecord) =>
    withDbQuery({
        operation: 'Remove label (soft delete)',
        queryFn: async () => {
            const [labelRecord] = await db
                .update(label)
                .set({
                    isActive: false,
                    updatedAt: new Date(),
                })
                .where(and(eq(label.id, id), eq(label.userId, userId)))
                .returning();

            return labelRecord;
        },
    });

/**
 * Bulk update label orders and parents for drag and drop operations
 * Updates all labels in a single transaction for better performance and consistency
 * @param items - Array of label items with new positions
 * @param userId - The user ID that owns all labels
 * @returns Promise resolving to void (use getAllFlattened to get fresh data)
 */
const reorder = async ({ items, userId }: { items: TLabelQuery['reorder']; userId: string }) =>
    withDbQuery({
        operation: 'Bulk reorder labels',
        queryFn: async () => {
            // If no items, return early
            if (items.length === 0) return { success: true, updatedCount: 0 };

            console.table(items);

            return { success: true, updatedCount: 0 };

            const now = new Date();

            // Single bulk update using CASE WHEN for maximum efficiency and safety

            const ids = items.map((item) => item.id);
            const indexCases = items.map(({ id, index }) => sql`WHEN ${id} THEN ${index}`);
            const parentCases = items.map(({ id, parentId }) =>
                parentId ? sql`WHEN ${id} THEN ${parentId}` : sql`WHEN ${id} THEN NULL`
            );

            await db
                .update(label)
                .set({
                    index: sql`CASE ${label.id} ${sql.join(indexCases, sql` `)} END`,
                    parentId: sql`CASE ${label.id} ${sql.join(parentCases, sql` `)} END`,
                    updatedAt: now,
                })
                .where(
                    and(
                        sql`${label.id} = ANY(${ids})`,
                        eq(label.userId, userId),
                        eq(label.isActive, true)
                    )
                );

            return { success: true, updatedCount: items.length };
        },
    });

const getMaxIndex = async ({ userId, parentId }: { userId: string; parentId?: string | null }) =>
    withDbQuery({
        operation: 'Get max index for user and parent',
        queryFn: async () => {
            const maxIndex = await db
                .select({ maxIndex: max(label.index) })
                .from(label)
                .where(
                    and(
                        eq(label.userId, userId),
                        eq(label.isActive, true),
                        parentId ? eq(label.parentId, parentId) : isNull(label.parentId)
                    )
                )
                .then((results) => results[0]?.maxIndex);

            return { maxIndex: maxIndex ?? 0 };
        },
    });

/**
 * Get all labels for a user in flattened order with global index based on hierarchical structure
 * Uses depth-first traversal to order labels: root first, then all its children recursively
 * Includes counts of children for each label
 * @param userId - The user ID to fetch labels for
 * @param filters - Optional filters for search
 * @returns Promise resolving to array of labels with global index, child counts, ordered by hierarchical structure
 */
const getAllFlattened = async ({
    userId,
    filters,
}: TQuerySelectUserRecords<TLabelQuery['filter']>): Promise<TLabelQuery['selectFlattened'][]> =>
    withDbQuery({
        operation: 'Get all labels flattened with global index',
        queryFn: async (): Promise<TLabelQuery['selectFlattened'][]> => {
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
            }>`
                SELECT * FROM base_query
                ORDER BY "globalIndex"
            `;

            const finalSql: SQL = sql.join([withRecursive, query], sql.raw(' '));

            const result = await db.execute<TLabelQuery['selectFlattened']>(finalSql);

            const schema = z.array(labelQuerySchemas.selectFlattened);

            const parsedResult = schema.parse(result);

            console.table(
                parsedResult.map((item) => ({
                    id: item.id,
                    index: item.index,
                    parentId: item.parentId,
                }))
            );

            return parsedResult;
        },
    });

export const labelQueries = {
    getAll,
    getAllFlattened,
    getRootLabels,
    getById,
    create,
    update,
    remove,
    reorder,
    getMaxIndex,
};
