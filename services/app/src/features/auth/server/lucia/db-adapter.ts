import { db } from '@db';
import { session, user, userSetting } from '@db/schema';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { InferSelectModel, eq } from 'drizzle-orm';
import { DatabaseSession, DatabaseUser } from 'lucia';

function transformIntoDatabaseSession(
    raw: InferSelectModel<typeof session>
): DatabaseSession {
    const { id, userId, expiresAt, ...attributes } = raw;
    return {
        userId,
        id,
        expiresAt,
        attributes
    };
}
function transformIntoDatabaseUser(
    raw: InferSelectModel<typeof user>,
    settings: InferSelectModel<typeof userSetting>
): DatabaseUser {
    const { id, ...attributes } = raw;
    const { userId, ...settingsAttributes } = settings;
    return {
        id,
        attributes: {
            ...attributes,
            settings: settingsAttributes
        }
    };
}

export class CustomDrizzlePostgreSQLAdapter extends DrizzlePostgreSQLAdapter {
    public async getSessionAndUser(
        sessionId: string
    ): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
        const result = await db
            .select({
                user: user,
                session: session,
                settings: userSetting
            })
            .from(session)
            .innerJoin(user, eq(session.userId, user.id))
            .innerJoin(userSetting, eq(session.userId, userSetting.userId))
            .where(eq(session.id, sessionId));
        if (result.length !== 1) return [null, null];
        return [
            transformIntoDatabaseSession(result[0].session),
            transformIntoDatabaseUser(result[0].user, result[0].settings)
        ];
    }
}
