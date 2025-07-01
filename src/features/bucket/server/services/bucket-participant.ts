import { bucketParticipantQuerySchemas } from '@/features/bucket/schemas';
import { bucketQueries } from '@/features/bucket/server/db/queries/bucket';
import { bucketParticipantQueries } from '@/features/bucket/server/db/queries/bucket-participant';
import { TQueryUpdateUserRecord } from '@/lib/schemas';

const addParticipant = async (
    data: typeof bucketParticipantQuerySchemas.insert._type,
    userId: string
) => {
    // Check if the user has access to the bucket
    const bucket = await bucketQueries.getById(data.bucketId, userId);
    if (!bucket) {
        throw new Error('Bucket not found or you do not have access');
    }

    const newParticipant = await bucketParticipantQueries.create(data);
    return newParticipant;
};

const updateParticipant = async (
    params: TQueryUpdateUserRecord<typeof bucketParticipantQuerySchemas.update._type>
) => {
    // We need to verify the user has access to the bucket this participant belongs to.
    const participant = await bucketParticipantQueries.getById(params.id);
    if (!participant) {
        throw new Error('Participant not found');
    }

    const bucket = await bucketQueries.getById(participant.bucketId, params.userId);
    if (!bucket) {
        throw new Error('Bucket not found or you do not have access');
    }

    const updatedParticipant = await bucketParticipantQueries.update(params);
    return updatedParticipant;
};

const removeParticipant = async (participantId: string, userId: string) => {
    // Verify user has access to the bucket this participant belongs to.
    const participant = await bucketParticipantQueries.getById(participantId);
    if (!participant) {
        throw new Error('Participant not found');
    }
    const bucket = await bucketQueries.getById(participant.bucketId, userId);
    if (!bucket) {
        throw new Error('Bucket not found or you do not have access');
    }

    const removedParticipant = await bucketParticipantQueries.remove({ id: participantId, userId });
    return removedParticipant;
};

export const bucketParticipantServices = {
    addParticipant,
    updateParticipant,
    removeParticipant,
    getAllForBucket: bucketParticipantQueries.getAllForBucket,
};
