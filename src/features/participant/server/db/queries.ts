import { participantSchemas } from '@/features/participant/schemas';
import { dbTable } from '@/server/db';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db/query';

export const participantQueries = createFeatureQueries
    .registerSchema(participantSchemas)
    .registerCoreQueries(dbTable.participant, {
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
