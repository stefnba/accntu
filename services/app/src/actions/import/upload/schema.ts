import { z } from 'zod';

export const ImportUploadSchema = z.object({
    files: z.custom<File[]>()
});
