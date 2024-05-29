import { z } from 'zod';

export const CreateAccountSchema = z.object({
    bankId: z.string(),
    accounts: z.array(
        z.object({
            value: z.string(),
            include: z.boolean()
        })
    )
});
