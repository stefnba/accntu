import { db } from '@/server/db';
import {
    SelectUserSchema,
    TUser,
    TUserCreateParams,
    TUserUpdateParams,
    user,
    userSettings,
} from '@/server/db/schemas';
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';

/**
 * Get a user by ID
 * @param id User ID
 * @returns User data or null if not found
 */
export const getUser = async (id: string) => {
    try {
        const userData = await db.select().from(user).where(eq(user.id, id)).limit(1);

        if (!userData.length) {
            return null;
        }

        return SelectUserSchema.parse(userData[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Failed to fetch user');
    }
};

/**
 * Update a user by ID
 * @param id User ID
 * @param data User data to update, this includes the user settings
 * @returns Updated user data or null if not found
 */
export const updateUser = async (id: string, data: TUserUpdateParams): Promise<TUser> => {
    try {
        const { settings, ...userData } = data;

        if (settings) {
            // Update user settings
            await db
                .update(userSettings)
                .set({
                    ...settings,
                })
                .where(eq(userSettings.userId, id));
        }

        // Update user data
        await db
            .update(user)
            .set({
                ...userData,
                updatedAt: new Date(),
            })
            .where(eq(user.id, id))
            .returning({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                updatedAt: user.updatedAt,
            });

        const updatedUser = await getUser(id);

        if (!updatedUser) {
            throw new Error('Failed to update user');
        }

        return updatedUser;
    } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Failed to update user');
    }
};

/**
 * Create a new user
 * @param data User data to create
 * @returns Created user data
 */
export const createUser = async (data: TUserCreateParams) => {
    try {
        const [createdUser] = await db
            .insert(user)
            .values({
                ...data,
                id: createId(),
                createdAt: new Date(),
            })
            .returning({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                createdAt: user.createdAt,
            });

        return createdUser;
    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('Failed to create user');
    }
};
