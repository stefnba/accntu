import { db, dbTable } from '@/server/db';

import { withDbQuery } from '@/server/lib/handler';
import { and, eq, sql } from 'drizzle-orm';

export const getRate = async ({
    baseCurrency,
    targetCurrency,
    date,
}: {
    baseCurrency: string;
    targetCurrency: string;
    date: string;
}) =>
    withDbQuery({
        operation: 'get exchange rate for currency pair and date',
        queryFn: async () => {
            const [result] = await db
                .select()
                .from(dbTable.transactionFxRate)
                .where(
                    and(
                        eq(dbTable.transactionFxRate.baseCurrency, baseCurrency),
                        eq(dbTable.transactionFxRate.targetCurrency, targetCurrency),
                        eq(dbTable.transactionFxRate.date, date)
                    )
                )
                .limit(1);

            return result || null;
        },
    });

export const getRatesForDate = async ({ date }: { date: string }) =>
    withDbQuery({
        operation: 'get all exchange rates for date',
        queryFn: async () => {
            return await db
                .select()
                .from(dbTable.transactionFxRate)
                .where(eq(dbTable.transactionFxRate.date, date));
        },
    });

export const createRate = async ({
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
        operation: 'create exchange rate',
        queryFn: async () => {
            const [result] = await db
                .insert(dbTable.transactionFxRate)
                .values({
                    baseCurrency,
                    targetCurrency,
                    exchangeRate: exchangeRate.toString(),
                    date,
                })
                .returning();

            return result;
        },
    });

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
                .insert(dbTable.transactionFxRate)
                .values({
                    baseCurrency,
                    targetCurrency,
                    exchangeRate: exchangeRate.toString(),
                    date,
                })
                .onConflictDoUpdate({
                    target: [
                        dbTable.transactionFxRate.baseCurrency,
                        dbTable.transactionFxRate.targetCurrency,
                        dbTable.transactionFxRate.date,
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
                .insert(dbTable.transactionFxRate)
                .values(values)
                .onConflictDoUpdate({
                    target: [
                        dbTable.transactionFxRate.baseCurrency,
                        dbTable.transactionFxRate.targetCurrency,
                        dbTable.transactionFxRate.date,
                    ],
                    set: {
                        exchangeRate: sql`excluded.exchange_rate`,
                        updatedAt: new Date(),
                    },
                })
                .returning();
        },
    });
