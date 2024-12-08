import type { TUserUpdateValues } from '@/features/user/schema/update-user';
import { db } from '@db';
import { user, userSetting } from '@db/schema';
import { User } from '@features/user/schema/get-user';
import { eq } from 'drizzle-orm';

import { findUser } from './get';

/**
 * Update user record together with userSettings fields.
 * @param id userId.
 * @param values values to be updated.
 * @returns public user fields.
 */
export const updateUser = async (
    userId: string,
    values: TUserUpdateValues
): Promise<User> => {
    const { settings: settingValues, ...updateValues } = values;

    try {
        if (settingValues && Object.keys(settingValues).length > 0) {
            await db
                .update(userSetting)
                .set(settingValues)
                .where(eq(userSetting.userId, userId));
        }

        await db
            .update(user)
            .set({ ...updateValues, updatedAt: new Date() })
            .where(eq(user.id, userId));

        const updatedUser = await findUser(userId);

        return updatedUser;
    } catch (e: any) {
        throw new Error(e);
    }
};
