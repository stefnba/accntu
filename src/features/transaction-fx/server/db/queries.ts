import { transactionFxSchemas } from '@/features/transaction-fx/schemas';
import { db } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';

import { transactionFxRate } from '@/features/transaction-fx/server/db/tables';
import { withDbQuery } from '@/server/lib/db';
import { and, eq, sql } from 'drizzle-orm';

export const transactionFxQueries = createFeatureQueries('transaction-fx')
    .registerSchema(transactionFxSchemas)
    /**
     * Get many exchange rates
     */
    .addQuery('getMany', {
        operation: 'get exchange rates by filters',
        fn: async ({ filters }) => {
            const whereConditions = [];

            if (filters?.baseCurrency) {
                whereConditions.push(eq(transactionFxRate.baseCurrency, filters.baseCurrency));
            }

            if (filters?.targetCurrency) {
                whereConditions.push(eq(transactionFxRate.targetCurrency, filters.targetCurrency));
            }

            if (filters?.date) {
                whereConditions.push(eq(transactionFxRate.date, filters.date));
            }

            const [result] = await db
                .select({
                    baseCurrency: transactionFxRate.baseCurrency,
                    targetCurrency: transactionFxRate.targetCurrency,
                    exchangeRate: transactionFxRate.exchangeRate,
                    date: transactionFxRate.date,
                })
                .from(transactionFxRate)
                .where(and(...whereConditions))
                .limit(1);

            return result || null;
        },
    })
    /**
     * Create exchange rate
     */
    .addQuery('create', {
        operation: 'create exchange rate',
        fn: async ({ data }) => {
            const [result] = await db.insert(transactionFxRate).values(data).returning();

            return result;
        },
    });

export type TTransactionFxQueries = InferFeatureType<typeof transactionFxQueries, 'getMany'>;

// ToDO
export const upsertRate = async ({
    baseCurrency,
    targetCurrency,
    exchangeRate,
    date,
}: {
    baseCurrency: string;
    targetCurrency: string;
    exchangeRate: number;
    date: string;
}) =>
    withDbQuery({
        operation: 'upsert exchange rate',
        queryFn: async () => {
            const [result] = await db
                .insert(transactionFxRate)
                .values({
                    baseCurrency,
                    targetCurrency,
                    exchangeRate: exchangeRate.toString(),
                    date,
                })
                .onConflictDoUpdate({
                    target: [
                        transactionFxRate.baseCurrency,
                        transactionFxRate.targetCurrency,
                        transactionFxRate.date,
                    ],
                    set: {
                        exchangeRate: exchangeRate.toString(),
                        updatedAt: new Date(),
                    },
                })
                .returning();

            return result;
        },
    });

// ToDO
export const batchUpsertRates = async ({
    rates,
}: {
    rates: Array<{
        baseCurrency: string;
        targetCurrency: string;
        exchangeRate: number;
        date: string;
    }>;
}) =>
    withDbQuery({
        operation: 'batch upsert exchange rates',
        queryFn: async () => {
            const values = rates.map((rate) => ({
                baseCurrency: rate.baseCurrency,
                targetCurrency: rate.targetCurrency,
                exchangeRate: rate.exchangeRate.toString(),
                date: rate.date,
            }));

            return await db
                .insert(transactionFxRate)
                .values(values)
                .onConflictDoUpdate({
                    target: [
                        transactionFxRate.baseCurrency,
                        transactionFxRate.targetCurrency,
                        transactionFxRate.date,
                    ],
                    set: {
                        exchangeRate: sql`excluded.exchange_rate`,
                        updatedAt: new Date(),
                    },
                })
                .returning();
        },
    });
