import { withDbQuery } from '@/server/lib/handler';
import { db } from '@/server/db';
import { eq, and, sql } from 'drizzle-orm';
import { transactionFxRate } from './schema';

export const getRate = async ({
    baseCurrency,
    targetCurrency,
    rateDate,
}: {
    baseCurrency: string;
    targetCurrency: string;
    rateDate: string;
}) =>
    withDbQuery({
        operation: 'get exchange rate for currency pair and date',
        queryFn: async () => {
            const [result] = await db
                .select()
                .from(transactionFxRate)
                .where(
                    and(
                        eq(transactionFxRate.baseCurrency, baseCurrency),
                        eq(transactionFxRate.targetCurrency, targetCurrency),
                        eq(transactionFxRate.rateDate, rateDate)
                    )
                )
                .limit(1);

            return result || null;
        },
    });

export const getRatesForDate = async ({ rateDate }: { rateDate: string }) =>
    withDbQuery({
        operation: 'get all exchange rates for date',
        queryFn: async () => {
            return await db
                .select()
                .from(transactionFxRate)
                .where(eq(transactionFxRate.rateDate, rateDate));
        },
    });

export const createRate = async ({
    baseCurrency,
    targetCurrency,
    exchangeRate,
    rateDate,
}: {
    baseCurrency: string;
    targetCurrency: string;
    exchangeRate: number;
    rateDate: string;
}) =>
    withDbQuery({
        operation: 'create exchange rate',
        queryFn: async () => {
            const [result] = await db
                .insert(transactionFxRate)
                .values({
                    baseCurrency,
                    targetCurrency,
                    exchangeRate: exchangeRate.toString(),
                    rateDate,
                })
                .returning();

            return result;
        },
    });

export const upsertRate = async ({
    baseCurrency,
    targetCurrency,
    exchangeRate,
    rateDate,
}: {
    baseCurrency: string;
    targetCurrency: string;
    exchangeRate: number;
    rateDate: string;
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
                    rateDate,
                })
                .onConflictDoUpdate({
                    target: [transactionFxRate.baseCurrency, transactionFxRate.targetCurrency, transactionFxRate.rateDate],
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
        rateDate: string;
    }>;
}) =>
    withDbQuery({
        operation: 'batch upsert exchange rates',
        queryFn: async () => {
            const values = rates.map(rate => ({
                baseCurrency: rate.baseCurrency,
                targetCurrency: rate.targetCurrency,
                exchangeRate: rate.exchangeRate.toString(),
                rateDate: rate.rateDate,
            }));

            return await db
                .insert(transactionFxRate)
                .values(values)
                .onConflictDoUpdate({
                    target: [transactionFxRate.baseCurrency, transactionFxRate.targetCurrency, transactionFxRate.rateDate],
                    set: {
                        exchangeRate: sql`excluded.exchange_rate`,
                        updatedAt: new Date(),
                    },
                })
                .returning();
        },
    });