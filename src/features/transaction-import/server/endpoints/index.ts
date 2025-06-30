import { Hono } from 'hono';
import importFileEndpoints from './import-file';
import importRecordEndpoints from './import-record';

const app = new Hono()

    // Import file endpoints
    .route('/files', importFileEndpoints)

    // Import record endpoints
    .route('/', importRecordEndpoints);

export default app;
