import { createFeatureTableConfig } from '@/server/lib/db/table/feature-config';
import z from 'zod';
import { transactionImport, transactionImportFile } from './tables';

export const transactionImportTableConfig = createFeatureTableConfig(transactionImport)
    .enablePagination()
    .enableFiltering({
        status: z.enum(['draft', 'pending', 'processing', 'completed', 'failed']),
        connectedBankAccountId: z.string(),
    })
    .build();

export const transactionImportFileTableConfig = createFeatureTableConfig(transactionImportFile)
    .enablePagination()
    .enableFiltering({
        status: z.enum(['uploaded', 'processing', 'processed', 'imported', 'failed']),
        importId: z.string(),
    })
    .build();
