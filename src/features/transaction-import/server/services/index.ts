import { transactionImportFileServices } from './import-file';
import { transactionImportServices } from './import-record';

export * from './import-file';
export * from './import-record';

export const importServices = {
    importFile: transactionImportFileServices,
    importRecord: transactionImportServices,
};
