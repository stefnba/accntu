import { z } from 'zod';

export const CreateTransactionImportFileSchema = z.object({
    importId: z.string().min(1, 'Import ID is required'),
    fileName: z.string().min(1, 'File name is required'),
    fileUrl: z.string().url('Valid file URL is required'),
    fileType: z.string().min(1, 'File type is required'),
    fileSize: z.number().min(1, 'File size must be greater than 0'),
    storageType: z.enum(['s3', 'local']).default('s3'),
    bucket: z.string().optional(),
    key: z.string().optional(),
    relativePath: z.string().optional(),
});

export const UpdateTransactionImportFileSchema = z.object({
    status: z.enum(['uploaded', 'processing', 'processed', 'imported', 'failed']).optional(),
    transactionCount: z.number().optional(),
    importedTransactionCount: z.number().optional(),
    parseErrors: z.array(z.unknown()).optional(),
    parsedTransactions: z.array(z.unknown()).optional(),
    importedAt: z.date().optional(),
});

export const CreateTransactionImportSchema = z.object({
    connectedBankAccountId: z.string().min(1, 'Connected bank account ID is required'),
});

export const UploadFileToImportSchema = z.object({
    importId: z.string().min(1, 'Import ID is required'),
    file: z.instanceof(File, { message: 'Valid file is required' }),
    fileName: z.string().optional(),
});

export type CreateTransactionImportFileInput = z.infer<typeof CreateTransactionImportFileSchema>;
export type UpdateTransactionImportFileInput = z.infer<typeof UpdateTransactionImportFileSchema>;
export type CreateTransactionImportInput = z.infer<typeof CreateTransactionImportSchema>;
export type UploadFileToImportInput = z.infer<typeof UploadFileToImportSchema>;