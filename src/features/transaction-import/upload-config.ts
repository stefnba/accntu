import type { UploadConfig } from '@/features/upload/schemas';

export const transactionImportUploadConfig: UploadConfig = {
    allowedFileTypes: [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    maxFileSize: 1024 * 1024 * 10, // 10MB
    allowedBuckets: [
        process.env.AWS_TRANSACTION_IMPORT_BUCKET!
    ]
};