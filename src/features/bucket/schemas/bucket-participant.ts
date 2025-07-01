import {
    insertBucketParticipantSchema,
    selectBucketParticipantSchema,
    updateBucketParticipantSchema,
} from '@/features/bucket/server/db/schemas';

export const bucketParticipantQuerySchemas = {
    select: selectBucketParticipantSchema,
    insert: insertBucketParticipantSchema,
    update: updateBucketParticipantSchema,
};
