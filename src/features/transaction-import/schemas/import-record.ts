import { transactionImportFileQuerySchemas } from '@/features/transaction-import/schemas/import-file';
import {
    insertTransactionImportSchema,
    selectTransactionImportSchema,
    updateTransactionImportSchema,
} from '@/server/db';
import { z } from 'zod';

// ====================
// Query Layer
// ====================

export const transactionImportQuerySchemas = {
    select: selectTransactionImportSchema.extend({
        files: z.array(transactionImportFileQuerySchemas.select),
        // connectedBankAccount: connectedBankAccountQuerySchemas.select,
    }),
    insert: insertTransactionImportSchema.pick({
        connectedBankAccountId: true,
    }),
    update: updateTransactionImportSchema.pick({
        status: true,
        importedTransactionCount: true,
        isActive: true,
        successAt: true,
        importedFileCount: true,
    }),
};

export type TTransactionImportQuerySchemas = {
    select: z.infer<typeof transactionImportQuerySchemas.select>;
    insert: z.infer<typeof transactionImportQuerySchemas.insert>;
    update: z.infer<typeof transactionImportQuerySchemas.update>;
};

// ====================
// Service/Endpoint Layer
// ====================

export const transactionImportServiceSchemas = {
    create: transactionImportQuerySchemas.insert,
    update: transactionImportQuerySchemas.update.pick({
        importedFileCount: true,
        importedTransactionCount: true,
    }),
};

export type TTransactionImportServiceSchemas = {
    create: z.infer<typeof transactionImportServiceSchemas.create>;
    update: z.infer<typeof transactionImportServiceSchemas.update>;
};

// ====================
// Custom Schemas
// ====================
