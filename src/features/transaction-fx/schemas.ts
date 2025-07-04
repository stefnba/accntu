import { z } from 'zod';

export const ExchangeRateSchema = z.object({
    baseCurrency: z.string().length(3).toUpperCase(),
    targetCurrency: z.string().length(3).toUpperCase(),
    exchangeRate: z.number().positive(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const GetRateQuerySchema = z.object({
    baseCurrency: z.string().length(3).toUpperCase(),
    targetCurrency: z.string().length(3).toUpperCase(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const ConvertAmountSchema = z.object({
    amount: z.number(),
    baseCurrency: z.string().length(3).toUpperCase(),
    targetCurrency: z.string().length(3).toUpperCase(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const BatchExchangeRatesSchema = z.object({
    rates: z.array(ExchangeRateSchema),
});

export type TExchangeRate = z.infer<typeof ExchangeRateSchema>;
export type TGetRateQuery = z.infer<typeof GetRateQuerySchema>;
export type TConvertAmount = z.infer<typeof ConvertAmountSchema>;
export type TBatchExchangeRates = z.infer<typeof BatchExchangeRatesSchema>;
