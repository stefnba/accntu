import { Hono } from 'hono';
import { bucketController } from './bucket';
import { bucketParticipantController } from './bucket-participant';
import { bucketTransactionController } from './transaction-bucket';

const app = new Hono()
    .route('/', bucketController)
    .route('/participants', bucketParticipantController)
    .route('/transaction', bucketTransactionController);

export default app;
