import { db } from '@/server/db';
import { SelectUserSchema, TUserCreateParams, TUserUpdateParams, user } from '@/server/db/schemas';
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
 * @param data User data to update
 * @returns Updated user data or null if not found
 */
export const updateUser = async (id: string, data: TUserUpdateParams) => {
    try {
        const [updatedUser] = await db
            .update(user)
            .set({
                ...data,
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
