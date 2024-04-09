'use server';

import db from '@/db';
import { createMutation } from '@/lib/mutation';

import { CreateImportSchema } from './schema';

/**
 * Create import record.
 */
export const createImport = createMutation(
    async ({ accountId, files }, user) => {
        const newImport = await db.import.create({
            data: {
                userId: user.id,
                accountId: accountId
            }
        });

        // Update files with importId
        await db.importFile.updateMany({
            where: {
                id: {
                    in: files
                }
            },
            data: {
                importId: newImport.id
            }
        });

        return {
            id: newImport.id
        };
    },
    CreateImportSchema
);
