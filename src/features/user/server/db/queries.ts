import { SelectUserSchema, user } from '@/server/db/schemas';

import { db } from '@/server/db';
import { withDbQuery } from '@/server/lib/handler';
import { eq } from 'drizzle-orm';

/**
 * Get a user record by email
 * @param params - User retrieval parameters
 * @param params.email - The email of the user
 * @returns The user record if found, otherwise null
 */
export const getUserRecordByEmail = async ({ email }: { email: string }) =>
    withDbQuery({
        outputSchema: SelectUserSchema.nullable(),
        operation: 'get user by email',
        queryFn: async () => {
            const result = await db
                .select({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    createdAt: user.createdAt,
                    lastLoginAt: user.lastLoginAt,
                    role: user.role,
                })
                .from(user)

                .where(eq(user.email, email))
                .then((result) => result[0]);

            return result;
        },
    });

/**
 * Get a user by ID
 * @param params - User retrieval parameters
 * @param params.userId - The ID of the user
 * @returns The user if found, otherwise null
 */
export const getUserRecordById = async ({ userId }: { userId: string }) =>
    withDbQuery({
        outputSchema: SelectUserSchema.nullable(),
        operation: 'get user by id',
        queryFn: async () => {
            const result = await db
                .select({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    createdAt: user.createdAt,
                    lastLoginAt: user.lastLoginAt,
                    role: user.role,
                })
                .from(user)
                .where(eq(user.id, userId))
                .then((result) => result[0]);

            return result;
        },
    });
