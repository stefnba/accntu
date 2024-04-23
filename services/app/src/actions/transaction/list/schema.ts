import { label, transaction } from '@/lib/db/schema';
import { inArrayFilter, inArrayWithNullFilter } from '@/lib/db/utils';
import { z } from 'zod';

type Entries<T> = {
    [K in keyof T]: [K, T[K]];
}[keyof T][];

// type Entries<T> = Array<[keyof T, T[keyof T]]>;

function getEntries<T extends object>(object: T): Entries<T> {
    return Object.entries(object) as Entries<T>;
}

export const FilterTransactionSchema = z.object({
    label: z
        .array(z.string().nullable())
        .optional()
        .transform((val) => inArrayWithNullFilter(transaction.labelId, val)),
    account: z
        .array(z.string().nullable())
        .optional()
        .transform((val) => inArrayWithNullFilter(transaction.labelId, val)),
    spendingCurrency: z
        .array(z.string())
        .optional()
        .transform((val) => inArrayFilter(transaction.spendingCurrency, val))
});

export type TTransactionFilter = z.input<typeof FilterTransactionSchema>;

export const PaginationTransactionSchema = z.object({
    page: z.number().optional(),
    pageSize: z.number().optional()
});

export const ListTransactionSchema = FilterTransactionSchema.and(
    PaginationTransactionSchema
);
