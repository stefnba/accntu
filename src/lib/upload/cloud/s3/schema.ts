import { z } from 'zod';

export const CreateUploadRecordSchema = z.object({
    url: z.string(),
    type: z.string(),
    filename: z.string(),
});

export const SignedS3UrlInputSchema = z.object({
    fileType: z.string(),
    fileSize: z.coerce.number(),
    checksum: z.string(),
    key: z.string().optional(),
});

export const DeleteS3FileSchema = z.object({
    key: z.string(),
    bucket: z.string(),
});

/**
 * Schema for the configuration of the S3 upload.
 */
export const S3UploadConfigSchema = z.object({
    allowedFileTypes: z.array(z.string()),
    maxFileSize: z.number(),
    bucket: z.string().optional(),
});
export type TS3UploadConfig = z.infer<typeof S3UploadConfigSchema>;
