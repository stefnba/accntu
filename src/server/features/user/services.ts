import { TUserCreateParams, TUserUpdateParams } from '@/server/db/schemas';
import * as UserQueries from '@/server/features/user/queries';

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
export const signupNewUser = async ({ data }: { data: TUserCreateParams }) => {
    // Create user record
    const newUser = await UserQueries.createUserRecord({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        image: data.image,
    });

    // Create user settings record
    const newUserSettings = await UserQueries.createUserSettingsRecord({
        userId: newUser.id,
    });

    return {
        ...newUser,
        settings: newUserSettings,
    };
};
