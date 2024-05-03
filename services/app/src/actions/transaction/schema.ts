import { TransactionTypeSchema, transaction } from '@/lib/db/schema';
import { inArrayFilter, inArrayWithNullFilter } from '@/lib/db/utils';
import { SQL, asc, desc, like } from 'drizzle-orm';
import { PgColumn } from 'drizzle-orm/pg-core';
import { z } from 'zod';

/** Converts a plain object's keys into array that is suitable for Zod enum with type safety and autocompletion */
function prepZodEnumFromObjectKeys<
    TI extends Record<string, any>,
    R extends string = TI extends Record<infer R, any> ? R : never
>(input: TI): [R, ...R[]] {
    const [firstKey, ...otherKeys] = Object.keys(input) as [R, ...R[]];
    return [firstKey, ...otherKeys];
}

export const UpdateTransactionSchema = z.object({
    id: z.string(),
    data: z.object({
        labelId: z.string().optional(),
        title: z.string().optional()
    })
});

const TransactionSchema = z.object({
    title: z.string().min(1),
    key: z.string().min(1),
    date: z.string(),
    spending_currency: z.string().length(3),
    spending_amount: z.number().nonnegative(),
    account_amount: z.number().nonnegative(),
    type: TransactionTypeSchema,
    account_currency: z.string().length(3),
    country: z.string().length(2).optional().nullable(),
    city: z.string().optional().nullable(),
    note: z.string().optional().nullable()
});

export const CreateTransactionsSchema = z.object({
    accountId: z.string(),
    importId: z.string(),
    transactions: z.array(TransactionSchema)
});

const orderByColumns = {
    title: transaction.title,
    date: transaction.date
};

// export type TOrderBy = Array<{ column: keyof typeof orderByColumns, direction:  }>;

const TransactionOrderByObjectSchema = z.object({
    column: z.enum(prepZodEnumFromObjectKeys(orderByColumns)),
    direction: z.enum(['asc', 'desc']).optional().default('asc')
});

export type TTransactionOrderByObject = z.input<
    typeof TransactionOrderByObjectSchema
>;

export const TransactionOrderBySchema = z.object({
    orderBy: z
        .array(TransactionOrderByObjectSchema)
        .optional()
        .default([
            { direction: 'desc', column: 'date' },
            { direction: 'asc', column: 'title' }
        ])
        .transform((val) => {
            return val.map((v) => {
                return {
                    column: orderByColumns[v.column],
                    direction: v.direction
                };
            });
        })
});

export const FilterTransactionSchema = z.object({
    title: z
        .string()
        .optional()
        .transform((val) =>
            val ? like(transaction.title, `%${val}%`) : undefined
        ),
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
        .transform((val) => inArrayFilter(transaction.spendingCurrency, val)),
    accountCurrency: z
        .array(z.string())
        .optional()
        .transform((val) => inArrayFilter(transaction.accountCurrency, val))
});

const TransactionFilterKeysSchema = FilterTransactionSchema.keyof();

type TTransactionFilterKeys = z.input<typeof TransactionFilterKeysSchema>;

export type TTransactionFilter = z.input<typeof FilterTransactionSchema>;

export const PaginationTransactionSchema = z.object({
    page: z.number().optional().default(1),
    pageSize: z.number().optional().default(10)
});

export const ListTransactionSchema = FilterTransactionSchema.and(
    PaginationTransactionSchema
).and(TransactionOrderBySchema);

export const FilterOptionsSchema = z
    .object({
        filterKey: TransactionFilterKeysSchema,
        filters: FilterTransactionSchema.optional()
    })
    .transform(({ filterKey, filters }) => {
        if (!filters) {
            return {
                filterKey
            };
        }

        // remove filter for this key
        delete filters[filterKey];

        return {
            filterKey,
            filters
        };
    });

export type TTransactionFilterOptions = z.input<typeof FilterOptionsSchema>;
