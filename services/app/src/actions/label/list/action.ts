'use server';

import { createFetch } from '@/lib/actions/fetch';
import { db } from '@/lib/db/client';

export const listLabel = createFetch(async (user) => {
    return db.query.label.findMany({
        where: (fields, { eq }) => eq(fields.userId, user.id)
    });
});
