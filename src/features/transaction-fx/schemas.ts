import { createFeatureSchemas } from '@/lib/schemas';
import { dbTable } from '@/server/db';
import { z } from 'zod';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');
const currency = z.string().length(3).toUpperCase();

export const { schemas: transactionFxSchemas } = createFeatureSchemas
    .registerTable(dbTable.transactionFxRate)
    .omit({
        createdAt: true,
        updatedAt: true,
        id: true,
    })
    .idFields({
        id: true,
    })
    /**
     * Create exchange rate
     */
    .addCore('create', ({ baseSchema, buildServiceInput }) => {
        return {
            service: buildServiceInput({ data: baseSchema }),
            query: buildServiceInput({ data: baseSchema }),
            endpoint: { json: baseSchema },
        };
    })
    /**
     * Get many exchange rates
     */
    .addCore('getMany', ({ buildServiceInput }) => {
        const filtersSchema = z.object({
            baseCurrency: currency.optional(),
            targetCurrency: currency.optional(),
            date: date.optional(),
        });

        return {
            service: buildServiceInput({ filters: filtersSchema }),
            query: buildServiceInput({ filters: filtersSchema }),
            endpoint: { query: filtersSchema },
        };
    })
    /**
     * Convert amount
     */
    .addCustom('convertAmount', ({ baseSchema }) => {
        const convertAmountSchema = z.object({
            amount: z.number(),
            baseCurrency: baseSchema.shape.baseCurrency,
            targetCurrency: baseSchema.shape.targetCurrency,
            date: date,
        });
        return {
            service: convertAmountSchema,
            endpoint: { json: convertAmountSchema },
        };
    });

export const BatchExchangeRatesSchema = z.object({
    rates: z.array(transactionFxSchemas.getMany.service),
});
