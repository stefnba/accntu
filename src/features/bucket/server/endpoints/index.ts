import { Hono } from 'hono';
import { bucketController } from './bucket';
import { bucketParticipantController } from './bucket-participant';

const app = new Hono().route('/', bucketController).route('/', bucketParticipantController);

export const bucketFeature = app;
