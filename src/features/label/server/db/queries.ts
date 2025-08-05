import { TLabelQuery } from '@/features/label/schemas';
import { label } from '@/features/label/server/db/schema';
import type {
    TQueryDeleteUserRecord,
    TQueryInsertUserRecord,
    TQuerySelectUserRecords,
    TQueryUpdateUserRecord,
} from '@/lib/schemas';
import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';
import { and, asc, eq, ilike, isNull, max } from 'drizzle-orm';

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
 * @param updates - Array of label updates with id, index, and optional parentId
 * @param userId - The user ID that owns all labels
 * @returns Promise resolving to array of updated label records
 */
const reorder = async ({
    updates,
    userId,
}: {
    updates: Array<{ id: string; index: number; parentId?: string | null }>;
    userId: string;
}) =>
    withDbQuery({
        operation: 'Bulk reorder labels',
        queryFn: async () => {
            const updatedLabels = [];

            // Update each label individually to ensure proper validation
            for (const { id, index, parentId } of updates) {
                const [updatedLabel] = await db
                    .update(label)
                    .set({
                        index,
                        parentId: parentId ?? null,
                        updatedAt: new Date(),
                    })
                    .where(
                        and(eq(label.id, id), eq(label.userId, userId), eq(label.isActive, true))
                    )
                    .returning();

                if (updatedLabel) {
                    updatedLabels.push(updatedLabel);
                }
            }

            return updatedLabels;
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

export const labelQueries = {
    getAll,
    getRootLabels,
    getById,
    create,
    update,
    remove,
    reorder,
    getMaxIndex,
};
