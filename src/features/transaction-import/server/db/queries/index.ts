import { importFileQueries } from '@/features/transaction-import/server/db/queries/import-file';
import { importRecordQueries } from '@/features/transaction-import/server/db/queries/import-record';

export * from './import-file';
export * from './import-record';

export const importQueries = {
    importFile: importFileQueries,
    importRecord: importRecordQueries,
};
