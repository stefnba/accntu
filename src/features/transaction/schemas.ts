import {
    insertTransactionSchema,
    selectTransactionSchema,
    updateTransactionSchema,
} from '@/features/transaction/server/db/schema';
import { z } from 'zod';

// ====================
// Query Layer
// ====================

export const transactionQuerySchemas = {
    select: selectTransactionSchema,
    insert: insertTransactionSchema,
    update: updateTransactionSchema,
};

export type TTransactionQuery = {
    select: z.infer<typeof transactionQuerySchemas.select>;
    insert: z.infer<typeof transactionQuerySchemas.insert>;
    update: z.infer<typeof transactionQuerySchemas.update>;
};

// ====================
// Service/Endpoint Layer
// ====================

export const transactionServiceSchemas = {
    create: transactionQuerySchemas.insert,
    update: transactionQuerySchemas.update,
};

export type TTransactionService = {
    create: z.infer<typeof transactionServiceSchemas.create>;
    update: z.infer<typeof transactionServiceSchemas.update>;
};

// ====================
// Custom Schemas
// ====================
