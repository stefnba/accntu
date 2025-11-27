import { transactionFxRateTableConfig } from '@/features/transaction-fx/server/db/config';
import { db } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db';

import { transactionFxRate } from '@/features/transaction-fx/server/db/tables';
import { withDbQuery } from '@/server/lib/db';
import { sql } from 'drizzle-orm';

export const transactionFxQueries = createFeatureQueries(
    'transaction-fx',
    transactionFxRateTableConfig
)
    .registerAllStandard()
    .build();

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
