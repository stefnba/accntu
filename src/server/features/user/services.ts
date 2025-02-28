import { db } from '@/server/db';
import { SelectUserSchema, TUserCreateParams, TUserUpdateParams, user } from '@/server/db/schemas';
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';

export const getUser = async (id: string) => {
    const userData = await db.select().from(user).where(eq(user.id, id));
    return SelectUserSchema.parse(userData);
};

export const updateUser = async (id: string, data: TUserUpdateParams) => {
    const [updatedUser] = await db.update(user).set(data).where(eq(user.id, id)).returning({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
    });
    return updatedUser;
};

export const createUser = async (data: TUserCreateParams) => {
    const [createdUser] = await db
        .insert(user)
        .values({
            ...data,
            id: createId(),
        })
        .returning({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
        });

    return createdUser;
};
