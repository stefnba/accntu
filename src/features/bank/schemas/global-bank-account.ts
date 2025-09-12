import { createFeatureSchemas, InferSchemas } from '@/lib/schemas';
import { globalBankAccount } from '@/features/bank/server/db/tables';
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
    .registerTable(globalBankAccount)
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
    .setIdFields({
        id: true,
    })
    /**
     * Create a global bank account
     */
    .addCore('create', ({ baseSchema, buildInput }) => {
        const input = buildInput({ data: baseSchema });
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
    .addCore('getMany', ({ buildInput, idFieldsSchema, baseSchema }) => {
        const filtersSchema = z.object({
            globalBankId: z.string().optional(),
            type: baseSchema.shape.type.optional(),
        });

        const paginationSchema = z.object({
            page: z.number().int().default(1),
            pageSize: z.number().int().default(20),
        });

        const input = buildInput({
            pagination: paginationSchema,
            filters: filtersSchema,
        });

        return {
            service: input,
            query: input,
            endpoint: {
                query: paginationSchema.extend(filtersSchema.shape),
                param: idFieldsSchema,
                // param: filtersSchema.shape,
            },
        };
    })
    /**
     * Get a global bank account by ID
     */
    .addCore('getById', ({ buildInput, idFieldsSchema }) => {
        return {
            service: buildInput(),
            query: buildInput(),
            endpoint: {
                param: idFieldsSchema,
            },
        };
    })
    /**
     * Update a global bank account by ID
     * Only done by admin
     */
    .addCore('updateById', ({ baseSchema, rawSchema, buildInput, idFieldsSchema }) => {
        const adminSchema = baseSchema.extend({
            isActive: rawSchema.shape.isActive,
        });

        return {
            service: buildInput({ data: adminSchema.partial() }),
            query: buildInput({ data: adminSchema.partial() }),
            form: adminSchema.partial(),
            endpoint: {
                json: adminSchema.partial(),
                param: idFieldsSchema,
            },
        };
    })
    /**
     * Remove a global bank account by ID
     */
    .addCore('removeById', ({ buildInput, idFieldsSchema }) => {
        return {
            service: buildInput(),
            query: buildInput(),
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

export type { TGlobalBankAccount } from '@/features/bank/server/db/queries/global-bank-account';
