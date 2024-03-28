import { z } from 'zod';

export const CreateUploadRecordSchema = z.object({
    url: z.string(),
    type: z.string(),
    filename: z.string()
});

export const DeleteUploadRecordSchema = z.object({
    id: z.string()
});
