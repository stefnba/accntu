import { and, eq, sql } from 'drizzle-orm';

import {
    bucketParticipant,
    insertParticipantSchema,
    selectParticipantSchema,
    updateParticipantSchema,
} from '@/features/bucket/server/db/schemas';
import { db } from '@/server/db';
import { z } from 'zod';

export const participantService = {
    getParticipants: async (userId: string) => {
        const result = await db
            .select()
            .from(bucketParticipant)
            .where(eq(bucketParticipant.userId, userId))
            .orderBy(bucketParticipant.name);

        return z.array(selectParticipantSchema).parse(result);
    },

    getParticipantById: async (id: string, userId: string) => {
        const result = await db
            .select()
            .from(bucketParticipant)
            .where(and(eq(bucketParticipant.id, id), eq(bucketParticipant.userId, userId)));

        if (result.length === 0) {
            throw new Error('Participant not found');
        }

        return selectParticipantSchema.parse(result[0]);
    },

    createParticipant: async (data: z.infer<typeof insertParticipantSchema>, userId: string) => {
        const newParticipant = await db
            .insert(bucketParticipant)
            .values({ ...data, userId })
            .returning();

        return selectParticipantSchema.parse(newParticipant[0]);
    },

    updateParticipant: async (
        id: string,
        data: z.infer<typeof updateParticipantSchema>,
        userId: string
    ) => {
        const updatedParticipant = await db
            .update(bucketParticipant)
            .set({ ...data, updatedAt: sql`now()` })
            .where(and(eq(bucketParticipant.id, id), eq(bucketParticipant.userId, userId)))
            .returning();

        if (updatedParticipant.length === 0) {
            throw new Error('Participant not found or you do not have permission to update it');
        }

        return selectParticipantSchema.parse(updatedParticipant[0]);
    },

    deleteParticipant: async (id: string, userId: string) => {
        const deletedParticipant = await db
            .delete(bucketParticipant)
            .where(and(eq(bucketParticipant.id, id), eq(bucketParticipant.userId, userId)))
            .returning();

        if (deletedParticipant.length === 0) {
            throw new Error('Participant not found or you do not have permission to delete it');
        }

        return { id };
    },
};
