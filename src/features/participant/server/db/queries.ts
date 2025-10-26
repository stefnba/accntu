import { participantSchemas } from '@/features/participant/schemas';
import { participant } from '@/features/participant/server/db/tables';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db/query';

export const participantQueries = createFeatureQueries('participant')
    .registerSchema(participantSchemas)
    .registerCoreQueries(participant, {
        idFields: ['id'],
        userIdField: 'userId',
        defaultIdFilters: {
            isActive: true,
        },
        queryConfig: {
            getMany: {
                filters: (filters, f) => [f.ilike('name', filters?.search)],
            },
        },
    });

export type TParticipant = InferFeatureType<typeof participantQueries>;
