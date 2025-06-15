import { Hono } from 'hono';
import connectedBankEndpoints from './connected-bank';
import connectedBankAccountEndpoints from './connected-bank-account';
import globalBankEndpoints from './global-bank';
import globalBankAccountEndpoints from './global-bank-account';

const app = new Hono()
    // Global bank endpoints
    .route('/global-banks', globalBankEndpoints)

    // Global bank account endpoints
    .route('/global-bank-accounts', globalBankAccountEndpoints)

    // Connected bank endpoints
    .route('/connected-banks', connectedBankEndpoints)

    // Connected bank account endpoints
    .route('/connected-bank-accounts', connectedBankAccountEndpoints);

export default app;
