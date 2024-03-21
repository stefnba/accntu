'use server';

import db from '@/db';
import { UserRole } from '@prisma/client';

interface ICreateUserInput {
    email: string;
    firstName?: string;
    lastName?: string;
    image?: string;
    role?: UserRole;
}

interface ICreateUserReturn {
    id: string;
}

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
