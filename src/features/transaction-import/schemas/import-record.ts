import { transactionImportTableConfig } from '@/features/transaction-import/server/db/config';
import { createFeatureSchemas } from '@/lib/schema';

export const transactionImportSchemas = createFeatureSchemas(transactionImportTableConfig)
    .registerAllStandard()
    .addSchema('activate', ({ helpers }) => {
        const s = helpers.buildIdentifierSchema();

        return { service: s, endpoint: { param: s.pick({ ids: true }) } };
    })
    .addSchema('updateCounts', ({ helpers }) => {
        const s = helpers.buildIdentifierSchema();

        return { service: s, endpoint: { param: s.pick({ ids: true }) } };
    })
    .build();

export type { TTransactionImport } from '@/features/transaction-import/server/db/queries/import-record';
