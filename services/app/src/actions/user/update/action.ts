'use server';

import db from '@/db';
import { createMutation } from '@/lib/mutation';

import { UpdateUserSchema } from './schema';

const ALLOWED_USER_FIELDS = ['email', 'firstName', 'lastName', 'image'];

/**
 * Update user record.
 */
export const updateUser = createMutation(async (data, user) => {
    // filter out any fields that are not allowed to be update in user table
    // todo check if zod can do this for us
    const updateData = Object.entries(data).reduce(
        (acc, [key, value]) => {
            if (ALLOWED_USER_FIELDS.includes(key)) {
                acc[key] = value;
            }
            return acc;
        },
        {} as Record<string, any>
    );

    // update user record
    const updateUser = await db.user.update({
        data: updateData,
        where: {
            id: user.id
        }
    });

    return {
        id: updateUser.id
    };
}, UpdateUserSchema);
