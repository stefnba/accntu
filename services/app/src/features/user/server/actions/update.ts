import type { TUserUpdateValues } from '@/features/user/schema/update-user';
import { db } from '@db';
import { user, userSetting } from '@db/schema';
import { eq } from 'drizzle-orm';

/**
 * Update user record together with userSettings fields.
 * @param id userId.
 * @param values values to be updated.
 * @returns public user fields.
 */
export const updateUser = async (id: string, values: TUserUpdateValues) => {
    const { settings: settingValues, ...updateValues } = values;

    try {
        let updatedSettings = settingValues;

        if (settingValues && Object.keys(settingValues).length > 0) {
            const [{ userId, ...updatedS }] = await db
                .update(userSetting)
                .set(settingValues)
                .where(eq(userSetting.userId, id))
                .returning();

            updatedSettings = updatedS;
        }

        const [updatedUser] = await db
            .update(user)
            .set({ ...updateValues, updatedAt: new Date() })
            .where(eq(user.id, id))
            .returning({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image
            });

        return { ...updatedUser, settings: updatedSettings };
    } catch (e) {
        console.log(e);
    }
};
