import { db } from '@db';
import { tagToTransaction, transaction } from '@db/schema';
import { inArrayFilter, inArrayWithNullFilter } from '@db/utils';
import { between, gte, ilike, lte, sql } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Schema for filter options with multiple selectable fields.
 */
const MultiSelectFilterSchema = z
    .union([z.array(z.string()), z.string()])
    .optional();

export type TMultiSelectFilter = z.infer<typeof MultiSelectFilterSchema>;

export const FilterTransactionSchema = z
    .object({
        startDate: z.coerce
            .date()
            .pipe(z.coerce.date())
            .transform((val) => {
                if (!val) return undefined;
                return gte(transaction.date, val.toDateString());
            }),
        endDate: z.coerce
            .date()
            .pipe(z.coerce.date())
            .transform((val) => {
                if (!val) return undefined;
                return lte(transaction.date, val.toDateString());
            }),
        title: z
            .string()
            .optional()
            .transform((val) =>
                val ? ilike(transaction.title, `%${val}%`) : undefined
            ),
        label: MultiSelectFilterSchema.transform((val) =>
            inArrayWithNullFilter(transaction.labelId, val)
        ),
        account: MultiSelectFilterSchema.transform((val) =>
            inArrayWithNullFilter(transaction.accountId, val)
        ),
        spendingCurrency: MultiSelectFilterSchema.transform((val) =>
            inArrayWithNullFilter(transaction.spendingCurrency, val)
        ),
        accountCurrency: MultiSelectFilterSchema.transform((val) =>
            inArrayWithNullFilter(transaction.accountCurrency, val)
        ),
        type: MultiSelectFilterSchema.transform((val) =>
            inArrayFilter(transaction.type, val)
        ),
        tag: MultiSelectFilterSchema.transform(async (val) => {
            const transactionIds = await db.query.tagToTransaction.findMany({
                columns: { transactionId: true },
                where: (tagToTransaction) =>
                    inArrayFilter(tagToTransaction.tagId, val)
            });
            return inArrayFilter(
                transaction.id,
                transactionIds.map((t) => t.transactionId)
            );
        })

        // date: z
        //     .discriminatedUnion('period', [
        //         z.object({
        //             period: z.literal('CUSTOM'),
        //             start: z.date().optional(),
        //             end: z.date().optional()
        //         }),
        //         z.object({
        //             period: z.enum([
        //                 'CURRENT_MONTH',
        //                 'CURRENT_YEAR',
        //                 'PREVIOUS_MONTH',
        //                 'PREVIOUS_YEAR'
        //             ])
        //         })
        //     ])
        //     .optional()
        //     .transform((val) => {
        //         if (!val) return undefined;

        //         if (val.period === 'CUSTOM') {
        //             const { start, end } = val;

        //             if (start && end) {
        //                 return between(
        //                     transaction.date,
        //                     start.toISOString(),
        //                     end.toISOString()
        //                 );
        //             }
        //             if (start && !end) {
        //                 return gte(transaction.date, start.toISOString());
        //             }
        //             if (!start && end) {
        //                 return lte(transaction.date, end.toISOString());
        //             }
        //         }

        //         if (val.period === 'PREVIOUS_YEAR') {
        //             return sql<boolean>`EXTRACT(YEAR FROM ${transaction.date}) = EXTRACT(YEAR FROM now()) - 1`;
        //         }

        //         if (val.period === 'PREVIOUS_MONTH') {
        //             return sql<boolean>`date_trunc('month', ${transaction.date}) = date_trunc('month', now() - interval '3 month')`;
        //         }

        //         if (val.period === 'CURRENT_YEAR') {
        //             return sql<boolean>`EXTRACT(YEAR FROM ${transaction.date}) = EXTRACT(YEAR FROM now())`;
        //         }

        //         if (val.period === 'CURRENT_MONTH') {
        //             return sql<boolean>`date_trunc('month', ${transaction.date}) = date_trunc('month', now())`;
        //         }
        //     }),
    })
    .partial();

export const TransactionFilterKeysSchema = FilterTransactionSchema.keyof();

export type TTransactionFilterKeys = z.input<
    typeof TransactionFilterKeysSchema
>;
export type TTransactionFilter = z.input<typeof FilterTransactionSchema>;
