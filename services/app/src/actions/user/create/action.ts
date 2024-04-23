'use server';

import { db, schema as dbSchema } from '@/db';

import { ICreateUserInput, ICreateUserReturn } from './types';

/**
 * Create new user record.
 */
export default async function createUser(
    user: ICreateUserInput
): Promise<ICreateUserReturn> {
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
}
