import { z } from 'zod';

export const FindByIdSchema = z.object({
    id: z.string()
});

export const FindByBankIdSchema = z.object({
    bankId: z.string()
});

export const ListByCountrySchema = z.object({
    country: z.string().length(2)
});
