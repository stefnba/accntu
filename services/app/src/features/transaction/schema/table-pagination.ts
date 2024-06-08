import { z } from 'zod';

export const PaginationTransactionSchema = z.object({
    page: z.coerce.number().optional().default(1),
    pageSize: z.coerce.number().optional().default(10)
});
