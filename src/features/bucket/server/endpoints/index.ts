import { Hono } from 'hono';
import { bucketController } from './bucket';
import { bucketParticipantController } from './bucket-participant';
import { transactionBucketController } from './transaction-bucket';

const app = new Hono()
    .route('/', bucketController)
    .route('/participants', bucketParticipantController)
    .route('/transaction', transactionBucketController);

export default app;
