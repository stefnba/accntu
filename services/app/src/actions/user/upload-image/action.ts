'use server';

import { db, schema as dbSchema } from '@/db';
import { createMutation } from '@/lib/mutation';
import { eq } from 'drizzle-orm';

import { UploadImageSchema } from './schema';

export const updloadImage = createMutation(async (data, user) => {
    const updatedUserProfile = await db
        .update(dbSchema.user)
        .set({
            image: data.image.name
        })
        .where(eq(dbSchema.user.id, user.id));

    return updatedUserProfile;
}, UploadImageSchema);
