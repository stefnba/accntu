import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { label, type Label, type NewLabel } from './schema';

// Validation schemas
const LabelSchema = z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    color: z.string().nullable(),
    rank: z.number(),
    level: z.number(),
    parentId: z.string().nullable(),
    firstParentId: z.string().nullable(),
    isDeleted: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

const LabelsArraySchema = z.array(LabelSchema);
const CreateLabelInputSchema = z.object({
    userId: z.string(),
    name: z.string(),
    description: z.string().optional(),
    color: z.string().optional(),
    rank: z.number().default(0),
    level: z.number().default(0),
    parentId: z.string().optional(),
    firstParentId: z.string().optional(),
});

/**
 * Create a new label
 * @param data - The data for the new label
 * @returns The created label
 */
export const createLabel = async (data: NewLabel): Promise<Label> =>
    withDbQuery({
        outputSchema: LabelSchema,
        operation: 'create label',
        queryFn: async () => {
            const [newLabel] = await db.insert(label).values(data).returning();
            return newLabel;
        },
    });

/**
 * Get all labels for a user
 * @param userId - The ID of the user
 * @returns The labels for the user
 */
export const getLabelsByUserId = async ({ userId }: { userId: string }): Promise<Label[]> =>
    withDbQuery({
        outputSchema: LabelsArraySchema,
        operation: 'get labels by user ID',
        queryFn: async () => {
            return await db
                .select()
                .from(label)
                .where(and(eq(label.userId, userId), eq(label.isDeleted, false)))
                .orderBy(label.level, label.rank, label.name);
        },
    });

/**
 * Get a label by ID
 * @param id - The ID of the label
 * @returns The label
 */
export const getLabelById = async ({ id }: { id: string }): Promise<Label | null> =>
    withDbQuery({
        outputSchema: LabelSchema.nullable(),
        operation: 'get label by ID',
        queryFn: async () => {
            const [result] = await db.select().from(label).where(eq(label.id, id)).limit(1);
            return result || null;
        },
    });

/**
 * Update a label
 * @param id - The ID of the label
 * @param data - The data to update the label with
 * @returns The updated label
 */
export const updateLabel = async ({
    id,
    data,
}: {
    id: string;
    data: Partial<NewLabel>;
}): Promise<Label | null> =>
    withDbQuery({
        outputSchema: LabelSchema.nullable(),
        operation: 'update label',
        queryFn: async () => {
            const [updated] = await db
                .update(label)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(label.id, id))
                .returning();
            return updated || null;
        },
    });

/**
 * Delete a label
 * @param id - The ID of the label
 * @returns The deleted label
 */
export const deleteLabel = async ({ id }: { id: string }): Promise<void> =>
    withDbQuery({
        outputSchema: z.void(),
        operation: 'delete label',
        queryFn: async () => {
            await db
                .update(label)
                .set({ isDeleted: true, updatedAt: new Date() })
                .where(eq(label.id, id));
        },
    });

/**
 * Get the hierarchy of labels for a user
 * @param userId - The ID of the user
 * @returns The hierarchy of labels
 */
export const getLabelHierarchy = async ({ userId }: { userId: string }): Promise<Label[]> =>
    withDbQuery({
        outputSchema: LabelsArraySchema,
        operation: 'get label hierarchy',
        queryFn: async () => {
            return await db
                .select()
                .from(label)
                .where(and(eq(label.userId, userId), eq(label.isDeleted, false)))
                .orderBy(label.level, label.rank, label.name);
        },
    });

/**
 * Get the root labels for a user
 * @param userId - The ID of the user
 * @returns The root labels
 */
export const getRootLabels = async ({ userId }: { userId: string }): Promise<Label[]> =>
    withDbQuery({
        outputSchema: LabelsArraySchema,
        operation: 'get root labels',
        queryFn: async () => {
            return await db
                .select()
                .from(label)
                .where(
                    and(
                        eq(label.userId, userId),
                        eq(label.isDeleted, false),
                        isNull(label.parentId)
                    )
                )
                .orderBy(label.rank, label.name);
        },
    });

/**
 * Get the child labels for a parent label
 * @param parentId - The ID of the parent label
 * @returns The child labels
 */
export const getChildLabels = async ({ parentId }: { parentId: string }): Promise<Label[]> =>
    withDbQuery({
        outputSchema: LabelsArraySchema,
        operation: 'get child labels',
        queryFn: async () => {
            return await db
                .select()
                .from(label)
                .where(and(eq(label.parentId, parentId), eq(label.isDeleted, false)))
                .orderBy(label.rank, label.name);
        },
    });
