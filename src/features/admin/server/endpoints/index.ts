import { routeHandler } from '@/server/lib/route';
import { Hono } from 'hono';
import { adminGlobalBankEndpoints } from './global-bank';
import { adminGlobalBankAccountEndpoints } from './global-bank-account';

const adminEndpoints = new Hono()
    .route('/global-banks', adminGlobalBankEndpoints)
    .route('/global-bank-accounts', adminGlobalBankAccountEndpoints)
    .get('/dashboard/stats', (c) =>
        routeHandler(c).handle(async () => ({
            users: { total: 0, active: 0, inactive: 0 },
            banks: { total: 0, active: 0 },
            accounts: { total: 0, templates: 0 },
            sessions: { active: 0 },
        }))
    );

export default adminEndpoints;
