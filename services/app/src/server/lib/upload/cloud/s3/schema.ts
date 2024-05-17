import { z } from 'zod';

export const CreateUploadRecordSchema = z.object({
    url: z.string(),
    type: z.string(),
    filename: z.string()
});

export const DeleteUploadRecordSchema = z.object({
    id: z.string()
});

export const SignedS3UrlInputSchema = z.object({
    fileType: z.string(),
    fileSize: z.number(),
    checksum: z.string(),
    key: z.string().optional()
});
