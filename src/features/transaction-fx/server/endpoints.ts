import { routeHandler } from '@/server/lib/route';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';
import { z } from 'zod';
import * as services from './services';

const GetRateSchema = z.object({
    baseCurrency: z.string().length(3).toUpperCase(),
    targetCurrency: z.string().length(3).toUpperCase(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

const StoreRateSchema = z.object({
    baseCurrency: z.string().length(3).toUpperCase(),
    targetCurrency: z.string().length(3).toUpperCase(),
    exchangeRate: z.number().positive(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

const ConvertAmountSchema = z.object({
    amount: z.number(),
    baseCurrency: z.string().length(3).toUpperCase(),
    targetCurrency: z.string().length(3).toUpperCase(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

const BatchStoreRatesSchema = z.object({
    rates: z.array(StoreRateSchema),
});

const app = new Hono()
    .get('/rate', zValidator('query', GetRateSchema), (c) =>
        routeHandler(c).handle(async ({ validatedInput }) => {
            const { baseCurrency, targetCurrency, date } = validatedInput.query;

            const rate = await services.getExchangeRate({
                baseCurrency,
                targetCurrency,
                date,
            });

            return {
                baseCurrency,
                targetCurrency,
                date,
                exchangeRate: rate,
            };
        })
    )

    .post('/rate', zValidator('json', StoreRateSchema), (c) =>
        routeHandler(c)
            .handleMutation(async ({ validatedInput }) => {
                const result = await services.storeExchangeRate(validatedInput.json);
                return result;
            })
    )

    .post('/rates/batch', zValidator('json', BatchStoreRatesSchema), (c) =>
        routeHandler(c)
            .handleMutation(async ({ validatedInput }) => {
                const { rates } = validatedInput.json;
                const result = await services.storeExchangeRates({ rates });
                return result;
            })
    )

    .post('/convert', zValidator('json', ConvertAmountSchema), (c) =>
        routeHandler(c).handle(async ({ validatedInput }) => {
            const { amount, baseCurrency, targetCurrency, date } = validatedInput.json;

            const convertedAmount = await services.convertAmount({
                amount,
                baseCurrency,
                targetCurrency,
                date,
            });

            return {
                originalAmount: amount,
                convertedAmount,
                baseCurrency,
                targetCurrency,
                date,
            };
        })
    );

export default app;
