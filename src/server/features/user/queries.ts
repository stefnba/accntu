import {
    InsertUserSchema,
    InsertUserSettingsSchema,
    SelectUserSchema,
    UpdateUserSchema,
    UpdateUserSettingsSchema,
    user,
    userSettings,
} from '@/server/db/schemas';

import { db } from '@/server/db';
import { withDbQueryValidated, withDbQueryValidatedNullable } from '@/server/lib/handler';
import { createId } from '@paralleldrive/cuid2';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

/**
 * Create a user record
 * @param params - User creation parameters
 * @param params.email - User's email
 * @param params.firstName - User's first name (optional)
 * @param params.lastName - User's last name (optional)
 * @param params.image - User's profile image URL (optional)
 * @returns The created user record
 */
export const createUserRecord = async (params: z.infer<typeof InsertUserSchema>) =>
    withDbQueryValidated({
        operation: 'create user',
        inputData: params,
        inputSchema: InsertUserSchema,
        queryFn: (validatedInput) =>
            db
                .insert(user)
                .values({
                    ...validatedInput,
                    id: createId(),
                })
                .returning({
                    id: user.id,
                })
                .then((result) => result[0]),
    });

/**
 * Get a user record by email
 * @param params - User retrieval parameters
 * @param params.email - The email of the user
 * @returns The user record if found, otherwise null
 */
export const getUserRecordByEmail = async ({ email }: { email: string }) =>
    withDbQueryValidatedNullable({
        outputSchema: SelectUserSchema,
        operation: 'get user by email',
        queryFn: async () => {
            const [result] = await db
                .select({
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    image: user.image,
                    createdAt: user.createdAt,
                    lastLoginAt: user.lastLoginAt,
                    role: user.role,
                    settings: {
                        theme: userSettings.theme,
                        language: userSettings.language,
                        timezone: userSettings.timezone,
                        currency: userSettings.currency,
                    },
                })
                .from(user)
                .innerJoin(userSettings, eq(user.id, userSettings.userId))
                .where(eq(user.email, email));

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
    withDbQueryValidatedNullable({
        outputSchema: SelectUserSchema,
        operation: 'get user by id',
        queryFn: async () => {
            const [result] = await db
                .select({
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    image: user.image,
                    createdAt: user.createdAt,
                    lastLoginAt: user.lastLoginAt,
                    role: user.role,
                    settings: {
                        theme: userSettings.theme,
                        language: userSettings.language,
                        timezone: userSettings.timezone,
                        currency: userSettings.currency,
                    },
                })
                .from(user)
                .innerJoin(userSettings, eq(user.id, userId))
                .where(eq(user.id, userId));

            return result;
        },
    });

/**
 * Create a user settings record
 * @param params - User settings creation parameters
 * @param params.userId - The ID of the user
 * @param params.theme - User's theme preference (optional)
 * @param params.language - User's language preference (optional)
 * @param params.timezone - User's timezone (optional)
 * @param params.currency - User's currency preference (optional)
 * @returns The created user settings record
 */
export const createUserSettingsRecord = async (params: z.infer<typeof InsertUserSettingsSchema>) =>
    withDbQueryValidated({
        operation: 'create user settings',
        inputData: params,
        inputSchema: InsertUserSettingsSchema,
        queryFn: (validatedInput) =>
            db
                .insert(userSettings)
                .values({
                    ...validatedInput,
                })
                .returning({
                    timezone: userSettings.timezone,
                    currency: userSettings.currency,
                    language: userSettings.language,
                    theme: userSettings.theme,
                })
                .then((result) => result[0]),
    });

/**
 * Update a user record
 * @param params - User update parameters
 * @param params.userId - The ID of the user
 * @param params.data - The data to update the user with
 * @returns The updated user record
 */
export const updateUserRecord = async ({
    userId,
    data,
}: {
    userId: string;
    data: z.infer<typeof UpdateUserSchema>;
}) =>
    withDbQueryValidated({
        operation: 'update user',
        inputData: data,
        inputSchema: UpdateUserSchema,
        queryFn: (validatedInput) =>
            db
                .update(user)
                .set({
                    ...validatedInput,
                    updatedAt: new Date(),
                })
                .where(eq(user.id, userId))
                .returning({
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    image: user.image,
                }),
    });

/**
 * Update a user settings record
 * @param params - User settings update parameters
 * @param params.userId - The ID of the user
 * @param params.data - The data to update the user settings with
 * @returns The updated user settings record
 */
export const updateUserSettingsRecord = async ({
    userId,
    data,
}: {
    userId: string;
    data: z.infer<typeof UpdateUserSettingsSchema>;
}) =>
    withDbQueryValidated({
        operation: 'update user settings',
        inputData: data,
        inputSchema: UpdateUserSettingsSchema,
        queryFn: (validatedInput) =>
            db
                .update(userSettings)
                .set({
                    ...validatedInput,
                })
                .where(eq(userSettings.userId, userId))
                .returning({
                    timezone: userSettings.timezone,
                    currency: userSettings.currency,
                    language: userSettings.language,
                    theme: userSettings.theme,
                })
                .then((result) => result[0]),
    });
