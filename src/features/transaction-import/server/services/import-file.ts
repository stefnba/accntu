import { transactionImportFileSchemas } from '@/features/transaction-import/schemas/import-file';
import { transactionImportFileQueries } from '@/features/transaction-import/server/db/queries/import-file';
import { createFeatureServices } from '@/server/lib/service';

export const transactionImportFileServices = createFeatureServices('transactionImportFile')
    .registerSchemas(transactionImportFileSchemas)
    .registerQueries(transactionImportFileQueries)
    .registerCoreServices()
    .build();
