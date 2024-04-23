import { z } from 'zod';

export const CreateImportSchema = z.object({
    accountId: z.string(),
    files: z.array(z.string()).min(1)
});

export const FindImportByIdSchema = z.object({
    id: z.string()
});
