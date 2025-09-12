import { transactionFxRate } from '@/features/transaction-fx/server/db/tables';
import { createFeatureSchemas } from '@/lib/schemas';
import { z } from 'zod';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');
const currency = z.string().length(3).toUpperCase();

export const { schemas: transactionFxSchemas } = createFeatureSchemas
    .registerTable(transactionFxRate)
    .omit({
        createdAt: true,
        updatedAt: true,
        id: true,
    })
    .setIdFields({
        id: true,
    })
    /**
     * Create exchange rate
     */
    .addCore('create', ({ baseSchema, buildInput }) => {
        return {
            service: buildInput({ data: baseSchema }),
            query: buildInput({ data: baseSchema }),
            endpoint: { json: baseSchema },
        };
    })
    /**
     * Get many exchange rates
     */
    .addCore('getMany', ({ buildInput }) => {
        const filtersSchema = z.object({
            baseCurrency: currency.optional(),
            targetCurrency: currency.optional(),
            date: date.optional(),
        });

        return {
            service: buildInput({ filters: filtersSchema }),
            query: buildInput({ filters: filtersSchema }),
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
