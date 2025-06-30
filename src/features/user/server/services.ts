import * as UserQueries from './db/queries';

/**
 * Get a user by ID
 * @param params - User retrieval parameters
 * @param params.userId - User ID
 * @returns User data or null if not found
 */
export const getUserProfile = async ({ userId }: { userId: string }) => {
    return UserQueries.getUserRecordById({ userId });
};
