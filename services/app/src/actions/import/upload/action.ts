'use server';

import db from '@/db';
import { createMutation } from '@/lib/mutation';

import { ImportUploadSchema } from './schema';

/**
 * Update user record.
 */
export const importUploadFile = createMutation(async (data, user) => {
    return {
        success: true
    };
}, ImportUploadSchema);
