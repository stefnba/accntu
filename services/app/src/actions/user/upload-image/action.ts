'use server';

import prisma from '@/db';
import { createMutation } from '@/lib/mutation';

import { UploadImageSchema } from './schema';

export const updloadImage = createMutation(async (data) => {
    const updatedUserProfile = await prisma.user.update({
        where: {
            id: 'user.id'
        },
        data
    });

    return updatedUserProfile;
}, UploadImageSchema);
