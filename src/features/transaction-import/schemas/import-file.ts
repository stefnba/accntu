import {
    insertTransactionImportFileSchema,
    selectTransactionImportFileSchema,
    updateTransactionImportFileSchema,
} from '@/features/transaction-import/server/db/schemas';
import { z } from 'zod';

// ====================
// Query Layer
// ====================

export const transactionImportFileQuerySchemas = {
    select: selectTransactionImportFileSchema,
    insert: insertTransactionImportFileSchema.pick({
        importId: true,
        fileName: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
        storageType: true,
    }),
    update: updateTransactionImportFileSchema.pick({
        status: true,
        transactionCount: true,
        importedTransactionCount: true,
        successAt: true,
    }),
};

export type TTransactionImportFileQuerySchemas = {
    select: z.infer<typeof transactionImportFileQuerySchemas.select>;
    insert: z.infer<typeof transactionImportFileQuerySchemas.insert>;
    update: z.infer<typeof transactionImportFileQuerySchemas.update>;
};

// ====================
// Service/Endpoint Layer
// ====================

export const transactionImportFileServiceSchemas = {
    create: transactionImportFileQuerySchemas.insert,
    update: transactionImportFileQuerySchemas.update.pick({
        status: true,
        transactionCount: true,
        importedTransactionCount: true,
    }),
};

export type TTransactionImportFileServiceSchemas = {
    create: z.infer<typeof transactionImportFileServiceSchemas.create>;
    update: z.infer<typeof transactionImportFileServiceSchemas.update>;
};

// ====================
// Custom Schemas
// ====================
