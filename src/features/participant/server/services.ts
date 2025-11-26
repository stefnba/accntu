import { participantSchemas } from '@/features/participant/schemas';
import { participantQueries } from '@/features/participant/server/db/queries';
import { createFeatureServices } from '@/server/lib/service/';

export const participantServices = createFeatureServices('participant')
    .registerSchema(participantSchemas)
    .registerQueries(participantQueries)
    .registerAllStandard()
    .build();
