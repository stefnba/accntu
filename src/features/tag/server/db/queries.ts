import { tagToTransactionSchemas } from '@/features/tag/schemas';
import { tagTableConfig, tagToTransactionTableConfig } from '@/features/tag/server/db/config';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';

export const tagQueries = createFeatureQueries('tag', tagTableConfig)
    .registerAllStandard({
        defaultFilters: {
            isActive: true,
        },
        getMany: {
            defaultOrdering: ['createdAt', 'name'],
            filters: (filters, f) => [f.ilike('name', filters?.name)],
        },
    })
    .build();
export type TTag = InferFeatureType<typeof tagQueries>;

export const tagToTransactionQueries = createFeatureQueries(
    'tag-to-transaction',
    tagToTransactionTableConfig
)
    .registerSchema(tagToTransactionSchemas)
    /**
     * Assign tags to a transaction
     * We already verify user owns the transaction in the service layer
     */
    .addQuery('assign', ({ tableOps }) => ({
        operation: 'assign tags to transaction',
        fn: async (input) => {
            // important: we already verify user owns the transaction in the service layer

            // Delete existing tags for this transaction
            tableOps.deleteRecord({
                identifiers: [{ field: 'transactionId', value: input.transactionId }],
            });

            // Create new tags for this transaction
            if (input.tagIds && input.tagIds.length > 0) {
                await tableOps.createManyRecords({
                    data: input.tagIds.map((tagId) => ({
                        tagId,
                        transactionId: input.transactionId,
                    })),
                    returnColumns: tagToTransactionTableConfig.getReturnColumns(),
                });
            }
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
    }))
    .build();
