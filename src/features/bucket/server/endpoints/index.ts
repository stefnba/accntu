import { Hono } from 'hono';

import bucketEndpoints from './bucket';
import participantEndpoints from './participant';

const app = new Hono().route('/participants', participantEndpoints).route('/', bucketEndpoints);

export default app;
