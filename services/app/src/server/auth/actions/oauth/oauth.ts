import { db } from '@db';
import { InsertoauthAccountSchema, oauthAccount } from '@db/schema';
import { createId } from '@paralleldrive/cuid2';
import { z } from 'zod';

type TCreateOAuthAccount = z.infer<typeof InsertoauthAccountSchema>;

export const createOAuthAccount = async ({
    provider,
    providerUserId,
    userId
}: TCreateOAuthAccount) => {
    const [newOAuthAccount] = await db
        .insert(oauthAccount)
        .values({
            id: createId(),
            provider,
            providerUserId,
            userId
        })
        .returning();

    return newOAuthAccount;
};
