'use server';

import { db, schema as dbSchema } from '@/db';
import { createMutation } from '@/lib/mutation';
import { eq } from 'drizzle-orm';

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
    const updateUser = await db
        .update(dbSchema.user)
        .set(updateData)
        .where(eq(dbSchema.user.id, user.id))
        .returning();

    return {
        id: updateUser[0].id
    };
}, UpdateUserSchema);
