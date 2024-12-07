import { db } from '@db';
import { user, userSetting } from '@db/schema';
import { eq } from 'drizzle-orm';

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
