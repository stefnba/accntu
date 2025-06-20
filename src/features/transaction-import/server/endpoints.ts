import { Hono } from 'hono';
import importRecordEndpoints from './endpoints/import-record';
import importFileEndpoints from './endpoints/import-file';

const app = new Hono()
    // Import record endpoints
    .route('/imports', importRecordEndpoints)
    
    // Import file endpoints
    .route('/files', importFileEndpoints);

export default app;