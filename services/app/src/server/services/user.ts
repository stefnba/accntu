import { db } from '@db';
import { user, userSetting } from '@db/schema';
import { createId } from '@paralleldrive/cuid2';
import { InferInsertModel, eq } from 'drizzle-orm';

export const createUser = async (
    values: Pick<InferInsertModel<typeof user>, 'email'>
) => {
    const [newUser] = await db
        .insert(user)
        .values({
            id: createId(),
            ...values
        })
        .returning({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            image: user.image
        });

    // create user settings record
    await db.insert(userSetting).values({
        userId: newUser.id
    });

    return newUser;
};

export const updateUser = async (
    id: string,
    values: Pick<
        InferInsertModel<typeof user>,
        'email' | 'firstName' | 'image' | 'lastName'
    >
) => {
    const [updatedUser] = await db
        .update(user)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(user.id, id))
        .returning({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            image: user.image
        });

    return updatedUser;
};

/**
 * Find a user by their id. Returns selected user fields with user settings as well.
 */
export const findUser = async (id: string) => {
    const [foundUser] = await db
        .select({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            image: user.image,
            settings: {
                language: userSetting.language,
                theme: userSetting.apparance,
                timezone: userSetting.timezone
            }
        })
        .from(user)
        .leftJoin(userSetting, eq(user.id, userSetting.userId))
        .where(eq(user.id, id));

    return foundUser;
};
