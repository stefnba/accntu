import { tagTableConfig, tagToTransactionTableConfig } from '@/features/tag/server/db/tables';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';

export const tagQueries = createFeatureQueries('tag', tagTableConfig).registerAllStandard({
    defaultFilters: {
        isActive: true,
    },
});

// .registerSchema(tagSchemas).registerCoreQueries(tag, {
//     queryConfig: {
//         getMany: {
//             filters: (filters, f) => [f.ilike('name', filters?.search)],
//         },
//     },
// });

export const tagToTransactionQueries = createFeatureQueries(
    'tag-to-transaction',
    tagToTransactionTableConfig
)
    /**
     * Assign tags to a transaction
     */
    .addQuery('assign', ({ tableOps }) => ({
        operation: 'assign tags to transaction',
        fn: async () => {
            return await tableOps.createRecord({
                data: {
                    tagId: '',
                    transactionId: '',
                },
                returnColumns: tagToTransactionTableConfig.getReturnColumns(),
            });
        },
    }))
    /**
     * Remove tags from a transaction
     */
    .addQuery('remove', ({ tableOps }) => ({
        operation: 'remove tags from transaction',
        fn: async () => {
            return await tableOps.deleteRecord({
                // todo add real transaction id
                identifiers: [
                    { field: 'transactionId', value: '' },
                    { field: 'tagId', value: '' },
                ],
            });
        },
    }));

// .registerSchema(tagToTransactionSchemas)
// /**
//  * Assign tags to a transaction
//  */
// .addQuery('assignToTransaction', {
//     operation: 'assign tags to transaction',
//     fn: async ({ tagIds, transactionId, userId }) => {
//         // First, remove existing tags for this transaction
//         await db
//             .delete(tagToTransaction)
//             .where(eq(tagToTransaction.transactionId, transactionId));

//         // Then add new tags if any
//         if (tagIds && tagIds.length > 0) {
//             await db.insert(tagToTransaction).values(
//                 tagIds.map((tagId) => ({
//                     transactionId,
//                     tagId,
//                 }))
//             );
//         }

//         return { success: true };
//     },
// });

export type TTag = InferFeatureType<typeof tagQueries>;
