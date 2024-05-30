import { z } from 'zod';

export const PaginationTransactionSchema = z.object({
    page: z.number().optional().default(1),
    pageSize: z.number().optional().default(10)
});
