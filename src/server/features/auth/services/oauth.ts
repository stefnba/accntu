import * as userQueries from '@/features/user/server/db/queries';
import { InsertAccountSchema, TOAuthProvider } from '@/server/db/schemas/auth';
import { errorFactory } from '@/server/lib/error';
import { z } from 'zod';
import * as oauthQueries from '../queries/oauth';

/**
 * Link an OAuth account to a user
 * @param params - Parameters for linking an OAuth account
 * @param params.userId - The user ID to link the account to
 * @param params.provider - The OAuth provider
 * @param params.providerAccountId - The provider's account ID
 * @param params.data - Additional account data
 * @returns The created OAuth account
 */
export const linkOAuthAccount = async ({
    userId,
    provider,
    providerAccountId,
    data,
}: {
    userId: string;
    provider: TOAuthProvider;
    providerAccountId: string;
    data: Omit<z.infer<typeof InsertAccountSchema>, 'userId' | 'provider' | 'providerAccountId'>;
}) => {
    // Check if the user exists
    const user = await userQueries.getUserRecordById({ userId });
    if (!user) {
        throw errorFactory.createServiceError({
            message: 'User not found',
            code: 'AUTH.USER_NOT_FOUND',
            statusCode: 404,
        });
    }

    // Check if the account is already linked to another user
    const existingAccount = await oauthQueries.getOAuthAccountRecordByProviderAccountId({
        provider,
        providerAccountId,
    });

    if (existingAccount && existingAccount.userId !== userId) {
        throw errorFactory.createServiceError({
            message: 'OAuth account already linked to another user',
            code: 'INTERNAL_SERVER_ERROR',
            statusCode: 409,
        });
    }

    // If the account is already linked to this user, update it
    if (existingAccount) {
        return oauthQueries.updateOAuthAccountRecord({
            userId,
            provider,
            data,
        });
    }

    // Otherwise, create a new account
    return oauthQueries.createOAuthAccountRecord({
        userId,
        provider,
        providerAccountId,
        ...data,
    });
};

/**
 * Get OAuth accounts for a user
 * @param params - Parameters for getting OAuth accounts
 * @param params.userId - The user ID
 * @returns Array of OAuth accounts
 */
export const getOAuthAccounts = async ({ userId }: { userId: string }) => {
    return oauthQueries.getOAuthAccountRecordsByUserId({ userId });
};

/**
 * Get an OAuth account by provider and provider account ID
 * @param params - Parameters for getting an OAuth account
 * @param params.provider - The OAuth provider
 * @param params.providerAccountId - The provider's account ID
 * @returns The OAuth account if found, otherwise null
 */
export const getOAuthAccount = async ({
    provider,
    providerAccountId,
}: {
    provider: TOAuthProvider;
    providerAccountId: string;
}) => {
    return oauthQueries.getOAuthAccountRecordByProviderAccountId({
        provider,
        providerAccountId,
    });
};

/**
 * Unlink an OAuth account from a user
 * @param params - Parameters for unlinking an OAuth account
 * @param params.userId - The user ID
 * @param params.provider - The OAuth provider
 * @returns True if successful
 */
export const unlinkOAuthAccount = async ({
    userId,
    provider,
}: {
    userId: string;
    provider: TOAuthProvider;
}) => {
    // Check if the user exists
    const user = await UserQueries.getUserRecordById({ userId });
    if (!user) {
        throw errorFactory.createServiceError({
            message: 'User not found',
            code: 'AUTH.USER_NOT_FOUND',
            statusCode: 404,
        });
    }

    // Check if the account exists
    const accounts = await oauthQueries.getOAuthAccountRecordsByUserId({ userId });
    const accountExists = accounts.some((account) => account.provider === provider);

    if (!accountExists) {
        throw errorFactory.createServiceError({
            message: 'OAuth account not found',
            code: 'INTERNAL_SERVER_ERROR',
            statusCode: 404,
        });
    }

    await oauthQueries.deleteOAuthAccountRecord({ userId, provider });
    return true;
};
