'use server';

import { db, schema as dbSchema } from '@/db';
import { createMutation } from '@/lib/actions';
import { eq } from 'drizzle-orm';

import { UpdateUserSchema, UploadImageSchema } from './schema';
import { ICreateUserInput, ICreateUserReturn } from './types';

/**
 * Update user record.
 */
export const update = createMutation(async ({ data, user }) => {
    const updatedUser = await db
        .update(dbSchema.user)
        .set(data)
        .where(eq(dbSchema.user.id, user.id))
        .returning();

    return {
        id: updatedUser[0].id
    };
}, UpdateUserSchema);

/**
 * Update user record.
 */
export const updloadImage = createMutation(async ({ data, user }) => {
    const updatedUserProfile = await db
        .update(dbSchema.user)
        .set({
            image: data.image.name
        })
        .where(eq(dbSchema.user.id, user.id));

    return updatedUserProfile;
}, UploadImageSchema);

/**
 * Create new user record.
 */
export const create = async (
    user: ICreateUserInput
): Promise<ICreateUserReturn> => {
    // create user record
    const newUser = (
        await db
            .insert(dbSchema.user)
            .values({
                ...user
            })
            .returning()
    )[0];

    // create user settings record
    await db.insert(dbSchema.userSetting).values({
        userId: newUser.id
    });

    return {
        id: newUser.id
    };
};
