import { currencyApiClient } from './api-client';
import * as queries from './db/queries';

/**
 * Get exchange rate for a given currency pair and date
 * @param baseCurrency - The base currency
 * @param targetCurrency - The target currency
 * @param rateDate - The date for the exchange rate
 * @returns The exchange rate
 */
export const getExchangeRate = async ({
    baseCurrency,
    targetCurrency,
    rateDate,
}: {
    baseCurrency: string;
    targetCurrency: string;
    rateDate: string;
}) => {
    if (baseCurrency === targetCurrency) {
        return 1;
    }

    const existingRate = await queries.getRate({
        baseCurrency,
        targetCurrency,
        rateDate,
    });

    if (existingRate) {
        return parseFloat(existingRate.exchangeRate);
    }

    throw new Error(`Exchange rate not found for ${baseCurrency}/${targetCurrency} on ${rateDate}`);
};

/**
 * Get or fetch exchange rate for a given currency pair and date
 * @param baseCurrency - The base currency
 * @param targetCurrency - The target currency
 * @param rateDate - The date for the exchange rate
 * @returns The exchange rate
 */
export const getOrFetchExchangeRate = async ({
    baseCurrency,
    targetCurrency,
    rateDate,
}: {
    baseCurrency: string;
    targetCurrency: string;
    rateDate: string;
}) => {
    if (baseCurrency === targetCurrency) {
        return 1;
    }

    // First, check database cache
    const existingRate = await queries.getRate({
        baseCurrency,
        targetCurrency,
        rateDate,
    });

    if (existingRate) {
        return parseFloat(existingRate.exchangeRate);
    }

    // If not in cache, fetch from API
    try {
        const apiResponse = await currencyApiClient.getExchangeRate(
            baseCurrency,
            targetCurrency,
            rateDate
        );

        // Store in database for future use
        await queries.upsertRate({
            baseCurrency,
            targetCurrency,
            exchangeRate: apiResponse.rate,
            rateDate,
        });

        return apiResponse.rate;
    } catch (error: any) {
        throw new Error(
            `Failed to fetch exchange rate for ${baseCurrency}/${targetCurrency} on ${rateDate}: ${error.message}`
        );
    }
};

/**
 * Get or fetch multiple exchange rates for a given currency pair and date
 * @param baseCurrency - The base currency
 * @param targetCurrencies - The target currencies
 * @param rateDate - The date for the exchange rates
 * @returns The exchange rates
 */
export const getOrFetchMultipleExchangeRates = async ({
    baseCurrency,
    targetCurrencies,
    rateDate,
}: {
    baseCurrency: string;
    targetCurrencies: string[];
    rateDate: string;
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

        const existingRate = await queries.getRate({
            baseCurrency,
            targetCurrency,
            rateDate,
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
                rateDate
            );

            // Store the fetched rates in database
            const ratesToStore = apiResults.map((result) => ({
                baseCurrency: result.base,
                targetCurrency: result.target,
                exchangeRate: result.rate,
                rateDate: result.date,
            }));

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
 * @param rateDate - The date for the exchange rate
 * @returns The exchange rate
 */
export const storeExchangeRate = async ({
    baseCurrency,
    targetCurrency,
    exchangeRate,
    rateDate,
}: {
    baseCurrency: string;
    targetCurrency: string;
    exchangeRate: number;
    rateDate: string;
}) => {
    return await queries.upsertRate({
        baseCurrency,
        targetCurrency,
        exchangeRate,
        rateDate,
    });
};

export const storeExchangeRates = async ({
    rates,
}: {
    rates: Array<{
        baseCurrency: string;
        targetCurrency: string;
        exchangeRate: number;
        rateDate: string;
    }>;
}) => {
    return await queries.batchUpsertRates({ rates });
};

/**
 * Convert amount from one currency to another
 * @param amount - The amount to convert
 * @param baseCurrency - The base currency
 * @param targetCurrency - The target currency
 * @param rateDate - The date for the exchange rate
 * @returns The converted amount
 */
export const convertAmount = async ({
    amount,
    baseCurrency,
    targetCurrency,
    rateDate,
}: {
    amount: number;
    baseCurrency: string;
    targetCurrency: string;
    rateDate: string;
}) => {
    const rate = await getOrFetchExchangeRate({
        baseCurrency,
        targetCurrency,
        rateDate,
    });

    return amount * rate;
};

export const convertMultipleAmounts = async ({
    conversions,
    rateDate,
}: {
    conversions: Array<{
        amount: number;
        baseCurrency: string;
        targetCurrency: string;
    }>;
    rateDate: string;
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
            rateDate,
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
