import {
    transactionImport,
    transactionImportFile,
} from '@/features/transaction-import/server/db/schemas';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';

// ====================
// Database schemas
// ====================

// Transaction Import
export const selectTransactionImportSchema = createSelectSchema(transactionImport);
export type TTransactionImport = z.infer<typeof selectTransactionImportSchema>;

export const insertTransactionImportSchema = createInsertSchema(transactionImport);
export type TInsertTransactionImport = z.infer<typeof insertTransactionImportSchema>;

export const updateTransactionImportSchema = createUpdateSchema(transactionImport).pick({
    status: true,
    importedTransactionCount: true,
    fileCount: true,
    importedFileCount: true,
    parseErrors: true,
    successAt: true,
});
export type TUpdateTransactionImport = z.infer<typeof updateTransactionImportSchema>;

// Transaction Import File
export const selectTransactionImportFileSchema = createSelectSchema(transactionImportFile);
export type TTransactionImportFile = z.infer<typeof selectTransactionImportFileSchema>;

export const insertTransactionImportFileSchema = createInsertSchema(transactionImportFile);
export type TInsertTransactionImportFile = z.infer<typeof insertTransactionImportFileSchema>;

export const updateTransactionImportFileSchema = createUpdateSchema(transactionImportFile).pick({
    status: true,
    transactionCount: true,
    importedTransactionCount: true,
    parseErrors: true,
    parsedTransactions: true,
    importedAt: true,
});
export type TUpdateTransactionImportFile = z.infer<typeof updateTransactionImportFileSchema>;

// ====================
// Custom schemas
// ====================

// Create draft transaction import
export const createDraftTransactionImportSchema = insertTransactionImportSchema.pick({
    connectedBankAccountId: true,
});
export type TCreateDraftTransactionImport = z.infer<typeof createDraftTransactionImportSchema>;

// Create transaction import (regular)
export const createTransactionImportSchema = insertTransactionImportSchema.pick({
    connectedBankAccountId: true,
});
export type TCreateTransactionImport = z.infer<typeof createTransactionImportSchema>;

// Create file from S3 upload
export const createFileFromS3Schema = z.object({
    importId: z.string().min(1, 'Import ID is required'),
    fileName: z.string().min(1, 'File name is required'),
    fileType: z.string().min(1, 'File type is required'),
    fileSize: z.number().min(1, 'File size must be greater than 0'),
    s3Key: z.string().min(1, 'S3 key is required'),
    s3Bucket: z.string().optional(),
});
export type TCreateFileFromS3 = z.infer<typeof createFileFromS3Schema>;

// Legacy file upload schema (for existing endpoints)
export const createTransactionImportFileSchema = insertTransactionImportFileSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    importedAt: true,
    isActive: true,
});
export type TCreateTransactionImportFile = z.infer<typeof createTransactionImportFileSchema>;

// File upload with File object (for frontend)
export const uploadFileToImportSchema = z.object({
    importId: z.string().min(1, 'Import ID is required'),
    file: z.instanceof(File, { message: 'Valid file is required' }),
    fileName: z.string().optional(),
});
export type TUploadFileToImport = z.infer<typeof uploadFileToImportSchema>;

// Update file status schema (for endpoints)
export const updateFileStatusSchema = z.object({
    status: z.enum(['uploaded', 'processing', 'processed', 'imported', 'failed']),
    transactionCount: z.number().optional(),
    importedTransactionCount: z.number().optional(),
    parseErrors: z.array(z.unknown()).optional(),
    parsedTransactions: z.array(z.unknown()).optional(),
});
export type TUpdateFileStatus = z.infer<typeof updateFileStatusSchema>;
