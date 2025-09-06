import { dbTable } from '@/server/db';

import { createFeatureSchemas, InferSchemas } from '@/lib/schemas';
import { z } from 'zod';

export const transformConfigSchema = z
    .object({
        type: z.enum(['csv', 'excel', 'json']),
        delimiter: z.string().optional(),
        hasHeader: z.boolean().optional(),
        encoding: z.string().optional(),
        skipRows: z.coerce.number().optional(),
        idColumns: z
            .union([z.string(), z.array(z.string())])
            .optional()
            .transform((val) => (Array.isArray(val) ? val : val?.split(',').map((v) => v.trim()))),
        dateFormat: z.string().optional(),
        sheetName: z.string().optional(),
        decimalSeparator: z.enum(['.', ',']).optional(),
        thousandsSeparator: z.enum([',', '.', ' ', '']).optional(),
        quoteChar: z.string().optional(),
        escapeChar: z.string().optional(),
        nullValues: z.array(z.string()).optional(),
    })
    .optional()
    .nullable();
export type TTransformConfig = z.infer<typeof transformConfigSchema>;

export const { schemas: globalBankAccountSchemas } = createFeatureSchemas
    .registerTable(dbTable.globalBankAccount)
    .omit({
        createdAt: true,
        updatedAt: true,
        isActive: true,
        id: true,
    })
    .transform((base) =>
        base.extend({
            transformConfig: transformConfigSchema,
        })
    )
    .idFields({
        id: true,
    })
    /**
     * Create a global bank account
     */
    .addCore('create', ({ baseSchema, buildServiceInput }) => {
        const input = buildServiceInput({ data: baseSchema });
        return {
            service: input,
            query: input,
            endpoint: {
                json: baseSchema,
            },
        };
    })
    /**
     * Get many global bank accounts
     */
    .addCore('getMany', ({ buildServiceInput, baseSchema }) => {
        const filtersSchema = z.object({
            globalBankId: z.string().optional(),
            type: baseSchema.shape.type.optional(),
        });

        const paginationSchema = z.object({
            page: z.number().int().default(1),
            pageSize: z.number().int().default(20),
        });

        const input = buildServiceInput({
            pagination: paginationSchema,
            filters: filtersSchema,
        });

        return {
            service: input,
            query: input,
            endpoint: {
                query: paginationSchema.extend(filtersSchema.shape),
            },
        };
    })
    /**
     * Get a global bank account by ID
     */
    .addCore('getById', ({ buildServiceInput, idFieldsSchema }) => {
        return {
            service: buildServiceInput(),
            query: buildServiceInput(),
            endpoint: {
                param: idFieldsSchema,
            },
        };
    })
    /**
     * Update a global bank account by ID
     */
    .addCore('updateById', ({ baseSchema, buildServiceInput, idFieldsSchema }) => {
        return {
            service: buildServiceInput({ data: baseSchema.partial() }),
            query: buildServiceInput({ data: baseSchema.partial() }),
            endpoint: {
                json: baseSchema.partial(),
                param: idFieldsSchema,
            },
        };
    })
    /**
     * Remove a global bank account by ID
     */
    .addCore('removeById', ({ buildServiceInput, idFieldsSchema }) => {
        return {
            service: buildServiceInput(),
            query: buildServiceInput(),
            endpoint: {
                param: idFieldsSchema,
            },
        };
    })
    /**
     * Test a global bank account transformation query
     */
    .addCustom('testTransform', ({ rawSchema }) => {
        const schema = z.object({
            transformQuery: rawSchema.shape.transformQuery,
            sampleTransformData: rawSchema.shape.sampleTransformData,
            transformConfig: transformConfigSchema.unwrap(),
        });

        return {
            service: schema,
            query: schema,
            endpoint: {
                json: schema,
            },
        };
    });

export type TGlobalBankAccountSchemas = InferSchemas<typeof globalBankAccountSchemas>;
