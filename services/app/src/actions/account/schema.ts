import { z } from 'zod';

export const CreateAccountSchema = z.object({
    bankId: z.string(),
    accounts: z.string().array().min(1)
});

export const FindAccountByIdSchema = z.object({
    id: z.string()
});
