import { z } from 'zod';

export const CreatAccountSchema = z.object({
    bankId: z.string(),
    accounts: z.string().array().min(1)
});
