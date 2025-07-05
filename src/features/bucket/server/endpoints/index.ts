import { Hono } from 'hono';

import { bucketController } from './bucket';
import { participantEndpoints } from './bucketParticipant';
import { bucketTransactionController } from './transaction-bucket';

const app = new Hono()
    .route('/buckets', bucketController)
    .route('/bucket-transactions', bucketTransactionController)
    .route('/participants', participantEndpoints);

export default app;
