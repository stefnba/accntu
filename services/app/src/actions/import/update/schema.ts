import { z } from 'zod';

export const UpdateImportSchema = z.object({
    id: z.string()
});
