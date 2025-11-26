import { participantSchemas } from '@/features/participant/schemas';
import { participantTableConfig } from '@/features/participant/server/db/config';
import { createFeatureQueries, InferFeatureType } from '@/server/lib/db/query';

export const participantQueries = createFeatureQueries('participant', participantTableConfig)
    .registerSchema(participantSchemas)
    .registerAllStandard({
        defaultFilters: {
            isActive: true,
        },
        getMany: {
            filters: (filters, f) => [f.ilike('name', filters?.search)],
        },
    })
    .build();

export type TParticipant = InferFeatureType<typeof participantQueries>;
