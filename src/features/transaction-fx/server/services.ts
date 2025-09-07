import { currencyApiClient } from './api-client';
import * as queries from './db/queries';

/**
 * Get exchange rate for a given currency pair and date
 * @param baseCurrency - The base currency
 * @param targetCurrency - The target currency
 * @param date - The date for the exchange rate
 * @returns The exchange rate
 */
export const getExchangeRate = async ({
    baseCurrency,
    targetCurrency,
    date,
}: {
    baseCurrency: string;
    targetCurrency: string;
    date: string;
}) => {
    if (baseCurrency === targetCurrency) {
        return 1;
    }

    const existingRate = await queries.transactionFxQueries.queries.getMany({
        filters: {
            baseCurrency,
            targetCurrency,
            date,
        },
    });

    if (existingRate) {
        return parseFloat(existingRate.exchangeRate);
    }

    throw new Error(`Exchange rate not found for ${baseCurrency}/${targetCurrency} on ${date}`);
};

/**
 * Get or fetch exchange rate for a given currency pair and date
 * @param baseCurrency - The base currency
 * @param targetCurrency - The target currency
 * @param date - The date for the exchange rate
 * @returns The exchange rate
 */
export const getOrFetchExchangeRate = async ({
    baseCurrency,
    targetCurrency,
    date,
}: {
    baseCurrency: string;
    targetCurrency: string;
    date: string;
}) => {
    if (baseCurrency === targetCurrency) {
        return 1;
    }

    // First, check database cache
    const existingRate = await queries.transactionFxQueries.queries.getMany({
        filters: {
            baseCurrency,
            targetCurrency,
            date,
        },
    });

    if (existingRate) {
        return parseFloat(existingRate.exchangeRate);
    }

    // If not in cache, fetch from API
    try {
        const apiResponse = await currencyApiClient.getExchangeRate(
            baseCurrency,
            targetCurrency,
            date
        );

        // Store in database for future use
        const ratesToStore = [
            {
                baseCurrency,
                targetCurrency,
                exchangeRate: apiResponse.rate,
                date,
            },
        ];

        if (apiResponse.rate !== 0) {
            ratesToStore.push({
                baseCurrency: targetCurrency,
                targetCurrency: baseCurrency,
                exchangeRate: 1 / apiResponse.rate,
                date,
            });
        }

        // await queries.batchUpsertRates({ rates: ratesToStore });

        return apiResponse.rate;
    } catch (error: any) {
        throw new Error(
            `Failed to fetch exchange rate for ${baseCurrency}/${targetCurrency} on ${date}: ${error.message}`
        );
    }
};

/**
 * Get or fetch multiple exchange rates for a given currency pair and date
 * @param baseCurrency - The base currency
 * @param targetCurrencies - The target currencies
 * @param date - The date for the exchange rates
 * @returns The exchange rates
 */
export const getOrFetchMultipleExchangeRates = async ({
    baseCurrency,
    targetCurrencies,
    date,
}: {
    baseCurrency: string;
    targetCurrencies: string[];
    date: string;
}) => {
    const results: Array<{
        baseCurrency: string;
        targetCurrency: string;
        exchangeRate: number;
        fromCache: boolean;
    }> = [];

    // First, check which rates we already have in the database
    const cachedRates = new Map<string, number>();
    const missingCurrencies: string[] = [];

    for (const targetCurrency of targetCurrencies) {
        if (baseCurrency === targetCurrency) {
            results.push({
                baseCurrency,
                targetCurrency,
                exchangeRate: 1,
                fromCache: true,
            });
            continue;
        }

        const existingRate = await queries.transactionFxQueries.queries.getMany({
            filters: {
                baseCurrency,
                targetCurrency,
                date,
            },
        });

        if (existingRate) {
            const rate = parseFloat(existingRate.exchangeRate);
            cachedRates.set(targetCurrency, rate);
            results.push({
                baseCurrency,
                targetCurrency,
                exchangeRate: rate,
                fromCache: true,
            });
        } else {
            missingCurrencies.push(targetCurrency);
        }
    }

    // If we have missing currencies, fetch them from API
    if (missingCurrencies.length > 0) {
        try {
            const apiResults = await currencyApiClient.getBatchExchangeRates(
                baseCurrency,
                missingCurrencies,
                date
            );

            // Store the fetched rates in database, including inverses
            const ratesToStore = apiResults.flatMap((result) => {
                const rates = [
                    {
                        baseCurrency: result.base,
                        targetCurrency: result.target,
                        exchangeRate: result.rate,
                        date: result.date,
                    },
                ];
                if (result.rate !== 0) {
                    rates.push({
                        baseCurrency: result.target,
                        targetCurrency: result.base,
                        exchangeRate: 1 / result.rate,
                        date: result.date,
                    });
                }
                return rates;
            });

            await queries.batchUpsertRates({ rates: ratesToStore });

            // Add API results to our results
            for (const apiResult of apiResults) {
                results.push({
                    baseCurrency: apiResult.base,
                    targetCurrency: apiResult.target,
                    exchangeRate: apiResult.rate,
                    fromCache: false,
                });
            }
        } catch (error: any) {
            throw new Error(`Failed to fetch missing exchange rates: ${error.message}`);
        }
    }

    return results;
};

/**
 * Store exchange rate for a given currency pair and date
 * @param baseCurrency - The base currency
 * @param targetCurrency - The target currency
 * @param exchangeRate - The exchange rate
 * @param date - The date for the exchange rate
 * @returns The exchange rate
 */
export const storeExchangeRate = async ({
    baseCurrency,
    targetCurrency,
    exchangeRate,
    date,
}: {
    baseCurrency: string;
    targetCurrency: string;
    exchangeRate: number;
    date: string;
}) => {
    const ratesToStore = [
        {
            baseCurrency,
            targetCurrency,
            exchangeRate,
            date,
        },
    ];

    if (exchangeRate !== 0) {
        ratesToStore.push({
            baseCurrency: targetCurrency,
            targetCurrency: baseCurrency,
            exchangeRate: 1 / exchangeRate,
            date,
        });
    }
    const storedRates = await queries.batchUpsertRates({ rates: ratesToStore });

    return storedRates.find(
        (r) => r.baseCurrency === baseCurrency && r.targetCurrency === targetCurrency
    )!;
};

/**
 * Store multiple exchange rates in the database
 * @param rates - The rates to store
 * @returns The stored rates
 */
export const storeExchangeRates = async ({
    rates,
}: {
    rates: Array<{
        baseCurrency: string;
        targetCurrency: string;
        exchangeRate: number;
        date: string;
    }>;
}) => {
    const allRates = rates.flatMap((rate) => {
        const ratePair = [
            {
                baseCurrency: rate.baseCurrency,
                targetCurrency: rate.targetCurrency,
                exchangeRate: rate.exchangeRate,
                date: rate.date,
            },
        ];

        if (rate.exchangeRate !== 0) {
            ratePair.push({
                baseCurrency: rate.targetCurrency,
                targetCurrency: rate.baseCurrency,
                exchangeRate: 1 / rate.exchangeRate,
                date: rate.date,
            });
        }
        return ratePair;
    });
    return await queries.batchUpsertRates({ rates: allRates });
};

/**
 * Convert amount from one currency to another
 * @param amount - The amount to convert
 * @param baseCurrency - The base currency
 * @param targetCurrency - The target currency
 * @param date - The date for the exchange rate
 * @returns The converted amount
 */
export const convertAmount = async ({
    amount,
    baseCurrency,
    targetCurrency,
    date,
}: {
    amount: number;
    baseCurrency: string;
    targetCurrency: string;
    date: string;
}) => {
    const rate = await getOrFetchExchangeRate({
        baseCurrency,
        targetCurrency,
        date,
    });

    return amount * rate;
};

export const convertMultipleAmounts = async ({
    conversions,
    date,
}: {
    conversions: Array<{
        amount: number;
        baseCurrency: string;
        targetCurrency: string;
    }>;
    date: string;
}) => {
    // Group conversions by base currency for efficient batch fetching
    const conversionsByBase = new Map<
        string,
        Array<{
            amount: number;
            targetCurrency: string;
            index: number;
        }>
    >();

    conversions.forEach((conversion, index) => {
        const { baseCurrency, targetCurrency, amount } = conversion;
        if (!conversionsByBase.has(baseCurrency)) {
            conversionsByBase.set(baseCurrency, []);
        }
        conversionsByBase.get(baseCurrency)!.push({
            amount,
            targetCurrency,
            index,
        });
    });

    const results: Array<{
        originalAmount: number;
        convertedAmount: number;
        baseCurrency: string;
        targetCurrency: string;
        exchangeRate: number;
        fromCache: boolean;
    }> = new Array(conversions.length);

    // Process each base currency group
    for (const [baseCurrency, groupConversions] of conversionsByBase) {
        const targetCurrencies = groupConversions.map((c) => c.targetCurrency);

        const rates = await getOrFetchMultipleExchangeRates({
            baseCurrency,
            targetCurrencies,
            date,
        });

        const rateMap = new Map(rates.map((r) => [r.targetCurrency, r]));

        for (const conversion of groupConversions) {
            const rate = rateMap.get(conversion.targetCurrency);
            if (!rate) {
                throw new Error(
                    `Failed to get exchange rate for ${baseCurrency}/${conversion.targetCurrency}`
                );
            }

            results[conversion.index] = {
                originalAmount: conversion.amount,
                convertedAmount: conversion.amount * rate.exchangeRate,
                baseCurrency,
                targetCurrency: conversion.targetCurrency,
                exchangeRate: rate.exchangeRate,
                fromCache: rate.fromCache,
            };
        }
    }

    return results;
};
