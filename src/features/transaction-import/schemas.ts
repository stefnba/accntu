import { z } from 'zod';

export const createTransactionImportSchema = z.object({
    connectedBankAccountId: z.string().min(1, 'Connected bank account is required'),
    fileName: z.string().min(1, 'File name is required'),
    fileUrl: z.string().url('Valid file URL is required'),
    fileSize: z.string().optional(),
});

export const parseTransactionImportSchema = z.object({
    importId: z.string().min(1, 'Import ID is required'),
});

export type CreateTransactionImportInput = z.infer<typeof createTransactionImportSchema>;
export type ParseTransactionImportInput = z.infer<typeof parseTransactionImportSchema>;