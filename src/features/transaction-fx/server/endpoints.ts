import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@/server/lib/validation';
import { Hono } from 'hono';
import { z } from 'zod';
import * as services from './services';

const GetRateSchema = z.object({
    baseCurrency: z.string().length(3).toUpperCase(),
    targetCurrency: z.string().length(3).toUpperCase(),
    rateDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

const StoreRateSchema = z.object({
    baseCurrency: z.string().length(3).toUpperCase(),
    targetCurrency: z.string().length(3).toUpperCase(),
    exchangeRate: z.number().positive(),
    rateDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

const ConvertAmountSchema = z.object({
    amount: z.number(),
    baseCurrency: z.string().length(3).toUpperCase(),
    targetCurrency: z.string().length(3).toUpperCase(),
    rateDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

const BatchStoreRatesSchema = z.object({
    rates: z.array(StoreRateSchema),
});

const app = new Hono()

    // get rate
    .get('/rate', zValidator('query', GetRateSchema), async (c) =>
        withRoute(c, async () => {
            const { baseCurrency, targetCurrency, rateDate } = c.req.valid('query');

            const rate = await services.getExchangeRate({
                baseCurrency,
                targetCurrency,
                rateDate,
            });

            return {
                baseCurrency,
                targetCurrency,
                rateDate,
                exchangeRate: rate,
            };
        })
    )

    // store rate
    .post('/rate', zValidator('json', StoreRateSchema), async (c) =>
        withRoute(
            c,
            async () => {
                const data = c.req.valid('json');

                const result = await services.storeExchangeRate(data);

                return result;
            },
            201
        )
    )

    // store rates
    .post('/rates/batch', zValidator('json', BatchStoreRatesSchema), async (c) =>
        withRoute(
            c,
            async () => {
                const { rates } = c.req.valid('json');

                const result = await services.storeExchangeRates({ rates });

                return result;
            },
            201
        )
    )

    // convert amount
    .post('/convert', zValidator('json', ConvertAmountSchema), async (c) =>
        withRoute(c, async () => {
            const { amount, baseCurrency, targetCurrency, rateDate } = c.req.valid('json');

            const convertedAmount = await services.convertAmount({
                amount,
                baseCurrency,
                targetCurrency,
                rateDate,
            });

            return {
                originalAmount: amount,
                convertedAmount,
                baseCurrency,
                targetCurrency,
                rateDate,
            };
        })
    );

export default app;
