'use server';

import db from '@/db';

import { ICreateUserInput, ICreateUserReturn } from './types';

/**
 * Create new user record.
 */
export default async function createUser(
    user: ICreateUserInput
): Promise<ICreateUserReturn> {
    // create user record
    const newUser = await db.user.create({
        data: user
    });

    // create user settings record
    await db.userSetting.create({
        data: {
            userId: newUser.id
        }
    });

    return {
        id: newUser.id
    };
}
