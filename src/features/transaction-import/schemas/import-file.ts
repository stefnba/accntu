import { transactionImportFileTableConfig } from '@/features/transaction-import/server/db/config';
import { createFeatureSchemas } from '@/lib/schema';
import z from 'zod';

export const transactionImportFileSchemas = createFeatureSchemas(transactionImportFileTableConfig)
    .registerAllStandard()
    .addSchema('parse', ({ schemas }) => {
        const s = schemas.userId.extend({
            fileId: z.string(),
        });

        return { service: s, endpoint: { param: s.pick({ fileId: true }) } };
    })
    .build();

export type { TTransactionImportFile } from '@/features/transaction-import/server/db/queries/import-file';
