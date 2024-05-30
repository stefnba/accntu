import { transaction } from '@db/schema';
import { inArrayFilter, inArrayWithNullFilter } from '@db/utils';
import { between, gte, ilike, lte, sql } from 'drizzle-orm';
import { z } from 'zod';

export const FilterTransactionSchema = z.object({
    date: z
        .discriminatedUnion('period', [
            z.object({
                period: z.literal('CUSTOM'),
                start: z.date().optional(),
                end: z.date().optional()
            }),
            z.object({
                period: z.enum([
                    'CURRENT_MONTH',
                    'CURRENT_YEAR',
                    'PREVIOUS_MONTH',
                    'PREVIOUS_YEAR'
                ])
            })
        ])
        .optional()
        .transform((val) => {
            if (!val) return undefined;

            if (val.period === 'CUSTOM') {
                const { start, end } = val;

                if (start && end) {
                    return between(
                        transaction.date,
                        start.toISOString(),
                        end.toISOString()
                    );
                }
                if (start && !end) {
                    return gte(transaction.date, start.toISOString());
                }
                if (!start && end) {
                    return lte(transaction.date, end.toISOString());
                }
            }

            if (val.period === 'PREVIOUS_YEAR') {
                return sql<boolean>`EXTRACT(YEAR FROM ${transaction.date}) = EXTRACT(YEAR FROM now()) - 1`;
            }

            if (val.period === 'PREVIOUS_MONTH') {
                return sql<boolean>`date_trunc('month', ${transaction.date}) = date_trunc('month', now() - interval '3 month')`;
            }

            if (val.period === 'CURRENT_YEAR') {
                return sql<boolean>`EXTRACT(YEAR FROM ${transaction.date}) = EXTRACT(YEAR FROM now())`;
            }

            if (val.period === 'CURRENT_MONTH') {
                return sql<boolean>`date_trunc('month', ${transaction.date}) = date_trunc('month', now())`;
            }
        }),
    title: z
        .string()
        .optional()
        .transform((val) =>
            val ? ilike(transaction.title, `%${val}%`) : undefined
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
export type TTransactionFilterKeys = z.input<
    typeof TransactionFilterKeysSchema
>;
export type TTransactionFilter = z.input<typeof FilterTransactionSchema>;
