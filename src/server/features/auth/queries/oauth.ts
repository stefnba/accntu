import { db } from '@/server/db';
import { authAccount, InsertAccountSchema, SelectAccountSchema } from '@/server/db/schemas/auth';
import {
    withDbQuery,
    withDbQueryValidated,
    withDbQueryValidatedNullable,
} from '@/server/lib/handler';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

// Define provider type
type AuthProvider = 'email' | 'github' | 'google';

/**
 * Create an OAuth account record
 * @param params - The account data
 * @param params.userId - The user ID
 * @param params.provider - The OAuth provider
 * @param params.providerAccountId - The provider's account ID
 * @param params.accessToken - The access token (optional)
 * @param params.refreshToken - The refresh token (optional)
 * @param params.expiresAt - The expiration date (optional)
 */
export const createOAuthAccountRecord = async (params: z.infer<typeof InsertAccountSchema>) =>
    withDbQueryValidated({
        operation: 'create OAuth account record',
        inputSchema: InsertAccountSchema,
        inputData: params,
        queryFn: (validatedData) => db.insert(authAccount).values(validatedData),
    });

/**
 * Get an OAuth account record by provider and provider account ID
 * @param params - The query parameters
 * @param params.provider - The OAuth provider
 * @param params.providerAccountId - The provider's account ID
 */
export const getOAuthAccountRecordByProviderAccountId = async ({
    provider,
    providerAccountId,
}: {
    provider: AuthProvider;
    providerAccountId: string;
}) =>
    withDbQueryValidatedNullable({
        operation: 'get OAuth account record by provider account ID',
        outputSchema: SelectAccountSchema,
        queryFn: async () => {
            const result = await db
                .select()
                .from(authAccount)
                .where(
                    and(
                        eq(authAccount.provider, provider),
                        eq(authAccount.providerAccountId, providerAccountId)
                    )
                )
                .limit(1);
            return result[0];
        },
    });

/**
 * Get all OAuth account records for a user
 * @param params - The query parameters
 * @param params.userId - The user ID
 */
export const getOAuthAccountRecordsByUserId = async ({ userId }: { userId: string }) =>
    withDbQueryValidated({
        operation: 'get OAuth account records by user ID',
        outputSchema: z.array(SelectAccountSchema),
        queryFn: async () => db.select().from(authAccount).where(eq(authAccount.userId, userId)),
    });

/**
 * Update an OAuth account record
 * @param params - The update parameters
 * @param params.userId - The user ID
 * @param params.provider - The OAuth provider
 * @param params.data - The data to update
 */
export const updateOAuthAccountRecord = async ({
    userId,
    provider,
    data,
}: {
    userId: string;
    provider: AuthProvider;
    data: Partial<z.infer<typeof InsertAccountSchema>>;
}) =>
    withDbQuery({
        operation: 'update OAuth account record',
        queryFn: () =>
            db
                .update(authAccount)
                .set({
                    ...data,
                    updatedAt: new Date(),
                })
                .where(and(eq(authAccount.userId, userId), eq(authAccount.provider, provider))),
    });

/**
 * Delete an OAuth account record
 * @param params - The delete parameters
 * @param params.userId - The user ID
 * @param params.provider - The OAuth provider
 */
export const deleteOAuthAccountRecord = async ({
    userId,
    provider,
}: {
    userId: string;
    provider: AuthProvider;
}) =>
    withDbQuery({
        operation: 'delete OAuth account record',
        queryFn: () =>
            db
                .delete(authAccount)
                .where(and(eq(authAccount.userId, userId), eq(authAccount.provider, provider))),
    });
