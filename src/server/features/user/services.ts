import { TUserCreateParams, TUserUpdateParams } from '@/server/db/schemas';
import * as UserQueries from '@/server/features/user/queries';
import { errorFactory } from '@/server/lib/error';

/**
 * Get a user by ID
 * @param params - User retrieval parameters
 * @param params.userId - User ID
 * @returns User data or null if not found
 */
export const getUserProfile = async ({ userId }: { userId: string }) => {
    return UserQueries.getUserRecordById({ userId });
};

/**
 * Update a user by ID
 * @param params - User update parameters
 * @param params.userId - User ID
 * @param params.data - User data to update, this includes the user settings
 * @returns Updated user data or null if not found
 */
export const updateUserProfile = async ({
    userId,
    data,
}: {
    userId: string;
    data: TUserUpdateParams;
}) => {
    const { settings, ...userData } = data;

    if (settings) {
        await UserQueries.updateUserSettingsRecord({
            userId,
            data: settings,
        });
    }

    // Update user data
    await UserQueries.updateUserRecord({
        userId,
        data: userData,
    });

    const updatedUserData = await UserQueries.getUserRecordById({ userId });

    return updatedUserData;
};

/**
 * Create a new user
 * @param params - User creation parameters
 * @param params.data - User data to create
 * @returns Created user data
 */
export const signupNewUser = async (params: TUserCreateParams) => {
    // check if email exits
    const existingUser = await UserQueries.getUserRecordByEmail({ email: params.email });
    if (existingUser) {
        throw errorFactory.createAuthError({
            message: 'Email already exists',
            code: 'AUTH.EMAIL_EXISTS',
        });
    }

    // Create user record
    const newUser = await UserQueries.createUserRecord(params);

    // Create user settings record
    await UserQueries.createUserSettingsRecord({
        userId: newUser.id,
    });

    const newUserWithSettings = await UserQueries.getUserRecordById({ userId: newUser.id });

    if (!newUserWithSettings) {
        throw errorFactory.createServiceError({
            message: 'Failed to create user',
            code: 'SERVICE.CREATE_FAILED',
        });
    }

    return newUserWithSettings;
};
