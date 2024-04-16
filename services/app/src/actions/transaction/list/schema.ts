import { z } from 'zod';

export const FilterTransactionSchema = z.object({
    title: z
        .string()
        .optional()
        .transform((val) => {
            const mode: 'insensitive' | 'default' = 'insensitive';

            return {
                contains: val,
                mode
            };
        }),
    account: z
        .array(z.string())
        .optional()
        .transform((val) => ({ in: val })), // transform to IN filter
    label: z
        .array(z.string())
        .optional()
        .transform((val) => {
            return {
                in: val
            };
        }) // transform to IN filter
});

export type TTransactionFilter = z.input<typeof FilterTransactionSchema>;

export const PaginationTransactionSchema = z.object({
    page: z.number().optional(),
    pageSize: z.number().optional()
});

export const ListTransactionSchema = FilterTransactionSchema.and(
    PaginationTransactionSchema
).transform((val) => {
    const { label, account, ...rest } = val;
    return {
        ...rest,
        labelId: label,
        accountId: account
    };
});
