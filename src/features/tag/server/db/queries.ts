import { tagSchemas, tagToTransactionSchemas } from '@/features/tag/schemas';
import { tag, tagToTransaction } from '@/features/tag/server/db/tables';
import { db } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';
import { eq } from 'drizzle-orm';

export const tagQueries = createFeatureQueries.registerSchema(tagSchemas).registerCoreQueries(tag, {
    idFields: ['id'],
    defaultIdFilters: {
        isActive: true,
    },
    userIdField: 'userId',
    allowedUpsertColumns: ['name', 'color', 'description'],
    queryConfig: {
        getMany: {
            filters: (filters, f) => [f.ilike('name', filters?.search)],
        },
    },
});

export const tagToTransactionQueries = createFeatureQueries
    .registerSchema(tagToTransactionSchemas)
    /**
     * Assign tags to a transaction
     */
    .addQuery('assignToTransaction', {
        operation: 'assign tags to transaction',
        fn: async ({ tagIds, transactionId, userId }) => {
            // First, remove existing tags for this transaction
            await db
                .delete(tagToTransaction)
                .where(eq(tagToTransaction.transactionId, transactionId));

            // Then add new tags if any
            if (tagIds && tagIds.length > 0) {
                await db.insert(tagToTransaction).values(
                    tagIds.map((tagId) => ({
                        transactionId,
                        tagId,
                    }))
                );
            }

            return { success: true };
        },
    });

export type TTag = InferFeatureType<typeof tagQueries>;
