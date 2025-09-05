import { connectedBank } from '@/features/bank/server/db/tables';
import { createFeatureSchemas, InferSchemas } from '@/lib/schemas';
import z from 'zod';

const apiCredentialsSchema = z
    .object({
        accessToken: z.string().optional(),
        refreshToken: z.string().optional(),
        apiKey: z.string().optional(),
        institutionId: z.string().optional(),
        expiresAt: z.date().optional(),
    })
    .optional();
export type TApiCredentials = z.infer<typeof apiCredentialsSchema>;

export const { schemas: connectedBankSchemas } = createFeatureSchemas
    .registerTable(connectedBank)
    .omit({
        createdAt: true,
        updatedAt: true,
        isActive: true,
        id: true,
        userId: true,
    })
    .transform((base) =>
        base.extend({
            apiCredentials: apiCredentialsSchema,
        })
    )
    .userField('userId')
    .idFields({
        id: true,
    })
    /**
     * Create a connected bank
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
     * Get many connected banks
     */
    .addCore('getMany', ({ buildServiceInput }) => {
        const filtersSchema = z.object({
            globalBankId: z.string().optional(),
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
     * Get a connected bank by id
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
     * Update a connected bank by id
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
     * Remove a connected bank by id
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
     * Create a connected bank with accounts
     */
    .addCustom('createWithAccounts', ({ baseSchema }) => {
        const schema = baseSchema.extend({
            connectedBankAccounts: z.array(
                z.object({
                    globalBankAccountId: z.string(),
                })
            ),
        });

        return {
            service: z.object({ data: schema, userId: z.string() }),
            query: z.object({ data: schema, userId: z.string() }),
            endpoint: {
                json: schema,
            },
        };
    });

export type TConnectedBankSchemas = InferSchemas<typeof connectedBankSchemas>;

export type { TConnectedBank } from '@/features/bank/server/db/queries/connected-bank';
