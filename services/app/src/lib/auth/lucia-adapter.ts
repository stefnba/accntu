import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { InferSelectModel, eq } from 'drizzle-orm';
import { DatabaseSession, DatabaseUser } from 'lucia';

import { db, schema as dbSchema } from '../db/client';

function transformIntoDatabaseSession(
    raw: InferSelectModel<typeof dbSchema.session>
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
    raw: InferSelectModel<typeof dbSchema.user>,
    settings: InferSelectModel<typeof dbSchema.userSetting>
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
                user: dbSchema.user,
                session: dbSchema.session,
                settings: dbSchema.userSetting
            })
            .from(dbSchema.session)
            .innerJoin(
                dbSchema.user,
                eq(dbSchema.session.userId, dbSchema.user.id)
            )
            .innerJoin(
                dbSchema.userSetting,
                eq(dbSchema.session.userId, dbSchema.userSetting.userId)
            )
            .where(eq(dbSchema.session.id, sessionId));
        if (result.length !== 1) return [null, null];
        return [
            transformIntoDatabaseSession(result[0].session),
            transformIntoDatabaseUser(result[0].user, result[0].settings)
        ];
    }
}
