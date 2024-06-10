import { z } from 'zod';

export const PaginationTransactionSchema = z
    .object({
        page: z
            .string()
            .optional()
            .transform((val) => Number(val))
            .pipe(z.number()),
        pageSize: z
            .string()
            .optional()
            .transform((val) => Number(val))
            .pipe(z.number())
    })
    .partial();
