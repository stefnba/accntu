import { user } from '@/lib/auth/server/db/tables';
import { db } from '@/server/db';
import { createId } from '@paralleldrive/cuid2';

/**
 * Creates a user in the database and returns the user object.
 */
export const createTestUser = async (): Promise<typeof user.$inferSelect> => {
    const id = createId();
    const email = `test-${id}@example.com`;

    // Query the database to get the ACTUAL user ID that was created
    const [createdUser] = await db
        .insert(user)
        .values({
            email,
            name: `Test User ${id}`,
            emailVerified: true,
            id,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        .returning();

    if (!createdUser) {
        throw new Error('Failed to retrieve created user from database');
    }

    return createdUser;
};
