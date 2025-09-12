import { connectedBank } from '@/features/bank/server/db/tables';

import { createFeatureSchemas, InferSchemas } from '@/lib/schemas';
import { z } from 'zod';

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
    .setUserIdField('userId')
    .setIdFields({
        id: true,
    })
    /**
     * Create a connected bank
     */
    .addCore('create', ({ baseSchema, buildInput }) => {
        const input = buildInput({ data: baseSchema });
        return {
            service: input,
            query: input,
            endpoint: {
                json: baseSchema.extend({
                    connectedBankAccounts: z.array(
                        z.object({
                            globalBankAccountId: z.string(),
                        })
                    ),
                }),
            },
        };
    })
    /**
     * Get many connected banks
     */
    .addCore('getMany', ({ buildInput }) => {
        const filtersSchema = z.object({
            globalBankId: z.string().optional(),
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
            },
        };
    })
    /**
     * Get a connected bank by id
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
     * Update a connected bank by id
     */
    .addCore('updateById', ({ baseSchema, buildInput, idFieldsSchema }) => {
        return {
            service: buildInput({ data: baseSchema.partial() }),
            query: buildInput({ data: baseSchema.partial() }),
            endpoint: {
                json: baseSchema.partial(),
                param: idFieldsSchema,
            },
        };
    })
    /**
     * Remove a connected bank by id
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
