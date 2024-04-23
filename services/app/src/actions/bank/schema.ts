import { z } from 'zod';

export const FindByIdSchema = z.object({
    id: z.string()
});

export const FindByBankIdSchema = z.object({
    bankId: z.string()
});
