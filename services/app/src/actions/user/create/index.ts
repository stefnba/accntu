'use server';

import db from '@/db';

interface ICreateUserInput {
    email: string;
}

interface ICreateUserReturn {
    id: string;
}

export default async function createUser(
    user: ICreateUserInput
): Promise<ICreateUserReturn> {
    // create user record
    const newUser = await db.user.create({
        data: {
            email: user.email
        }
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
