import { logger } from '@/server/lib/logging/logger';
import { db } from '@db';
import { user, userSetting } from '@db/schema';
import { createId } from '@paralleldrive/cuid2';
import { InferInsertModel } from 'drizzle-orm';

/**
 * Create a new user record, mainly done through signing up route.
 * @param values
 * @returns
 */
export const createUser = async (
    values: Pick<
        InferInsertModel<typeof user>,
        'email' | 'firstName' | 'lastName' | 'image'
    >
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

    logger.info('User created as part of email login', {
        email: newUser.email,
        userId: newUser.id
    });

    return newUser;
};
