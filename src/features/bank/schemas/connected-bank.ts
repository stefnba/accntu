import { connectedBankTableConfig } from '@/features/bank/server/db/config';

import { createFeatureSchemas } from '@/lib/schema';
import { z } from 'zod';

export const apiCredentialsSchema = z
    .object({
        accessToken: z.string().optional(),
        refreshToken: z.string().optional(),
        apiKey: z.string().optional(),
        institutionId: z.string().optional(),
        expiresAt: z.date().optional(),
    })
    .optional();
export type TApiCredentials = z.infer<typeof apiCredentialsSchema>;

export const connectedBankSchemas = createFeatureSchemas(connectedBankTableConfig)
    .registerAllStandard()
    .addSchema('createWithAccounts', ({ schemas }) => {
        const schema = schemas.inputData.insert.extend({
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
    })
    .build();

// /**
//  * Create a connected bank
//  */
// .addCore('create', ({ baseSchema, buildInput }) => {
//     const input = buildInput({ data: baseSchema });
//     return {
//         service: input,
//         query: input,
//         endpoint: {
//             json: baseSchema.extend({
//                 connectedBankAccounts: z.array(
//                     z.object({
//                         globalBankAccountId: z.string(),
//                     })
//                 ),
//             }),
//         },
//     };
// })
// /**
//  * Get many connected banks
//  */
// .addCore('getMany', ({ buildInput }) => {
//     const filtersSchema = z.object({
//         globalBankId: z.string().optional(),
//     });

//     const paginationSchema = z.object({
//         page: z.coerce.number().int().default(1),
//         pageSize: z.coerce.number().int().default(20),
//     });

//     const input = buildInput({
//         pagination: paginationSchema,
//         filters: filtersSchema,
//     });

//     return {
//         service: input,
//         query: input,
//         endpoint: {
//             query: paginationSchema.extend(filtersSchema.shape),
//         },
//     };
// })
// /**
//  * Get a connected bank by id
//  */
// .addCore('getById', ({ buildInput, idFieldsSchema }) => {
//     return {
//         service: buildInput(),
//         query: buildInput(),
//         endpoint: {
//             param: idFieldsSchema,
//         },
//     };
// })
// /**
//  * Update a connected bank by id
//  */
// .addCore('updateById', ({ baseSchema, buildInput, idFieldsSchema }) => {
//     return {
//         service: buildInput({ data: baseSchema.partial() }),
//         query: buildInput({ data: baseSchema.partial() }),
//         endpoint: {
//             json: baseSchema.partial(),
//             param: idFieldsSchema,
//         },
//     };
// })
// /**
//  * Remove a connected bank by id
//  */
// .addCore('removeById', ({ buildInput, idFieldsSchema }) => {
//     return {
//         service: buildInput(),
//         query: buildInput(),
//         endpoint: {
//             param: idFieldsSchema,
//         },
//     };
// })
/**
 * Create a connected bank with accounts
 */

export type { TConnectedBank } from '@/features/bank/server/db/queries/connected-bank';
