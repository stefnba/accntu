import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import * as queries from './db/queries';
import {
    CreateConnectedBankAccountSchema,
    CreateConnectedBankSchema,
    SearchGlobalBanksSchema,
} from './db/schema';

// Create a new Hono app for bank routes
const app = new Hono();

// Global Banks Routes
app.get('/global-banks', zValidator('query', SearchGlobalBanksSchema), async (c) =>
    withRoute(c, async () => {
        const { query, country } = c.req.valid('query');

        if (query || country) {
            return await queries.searchGlobalBanks({ query: query || '', country });
        } else {
            return await queries.getAllGlobalBanks();
        }
    })
);

app.get('/global-banks/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
    withRoute(c, async () => {
        const { id } = c.req.valid('param');
        const bank = await queries.getGlobalBankById({ id });
        if (!bank) {
            throw new Error('Global bank not found');
        }
        return bank;
    })
);

app.get(
    '/global-banks/country/:country',
    zValidator('param', z.object({ country: z.string() })),
    async (c) =>
        withRoute(c, async () => {
            const { country } = c.req.valid('param');
            return await queries.getGlobalBanksByCountry({ country });
        })
);

app.get(
    '/global-banks/:id/accounts',
    zValidator('param', z.object({ id: z.string() })),
    async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            return await queries.getGlobalBankAccountsByBankId({ globalBankId: id });
        })
);

app.get('/global-bank-accounts/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
    withRoute(c, async () => {
        const { id } = c.req.valid('param');
        const account = await queries.getGlobalBankAccountById({ id });
        if (!account) {
            throw new Error('Global bank account not found');
        }
        return account;
    })
);

app.get('/global-banks/search', zValidator('query', SearchGlobalBanksSchema), async (c) =>
    withRoute(c, async () => {
        const { query, country } = c.req.valid('query');
        return await queries.searchGlobalBanks({ query: query || '', country });
    })
);

// Connected Bank Routes
app.get('/connected-banks', async (c) =>
    withRoute(c, async () => {
        const user = getUser(c);
        return await queries.getConnectedBanksByUserId({ userId: user.id });
    })
);

app.get('/connected-banks/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
    withRoute(c, async () => {
        const { id } = c.req.valid('param');
        const bank = await queries.getConnectedBankById({ id });
        if (!bank) {
            throw new Error('Connected bank not found');
        }
        return bank;
    })
);

app.post('/connected-banks', zValidator('json', CreateConnectedBankSchema), async (c) =>
    withRoute(
        c,
        async () => {
            const user = getUser(c);
            const data = c.req.valid('json');
            return await queries.createConnectedBank({
                data: { ...data, userId: user.id },
            });
        },
        201
    )
);

// Connected Bank Account Routes
app.get('/connected-bank-accounts', async (c) =>
    withRoute(c, async () => {
        const user = getUser(c);
        return await queries.getConnectedBankAccountsByUserId({ userId: user.id });
    })
);

app.get(
    '/connected-banks/:id/accounts',
    zValidator('param', z.object({ id: z.string() })),
    async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            return await queries.getConnectedBankAccountsByConnectedBankId({
                connectedBankId: id,
            });
        })
);

app.get(
    '/connected-bank-accounts/:id',
    zValidator('param', z.object({ id: z.string() })),
    async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            const account = await queries.getConnectedBankAccountById({ id });
            if (!account) {
                throw new Error('Connected bank account not found');
            }
            return account;
        })
);

app.post(
    '/connected-bank-accounts',
    zValidator('json', CreateConnectedBankAccountSchema),
    async (c) =>
        withRoute(
            c,
            async () => {
                const data = c.req.valid('json');
                // Filter out null values to undefined
                const processedData = {
                    ...data,
                    accountNumber: data.accountNumber || undefined,
                    iban: data.iban || undefined,
                    routingNumber: data.routingNumber || undefined,
                    currency: data.currency || undefined,
                    customCsvConfig: data.customCsvConfig || undefined,
                };
                return await queries.createConnectedBankAccount({ data: processedData });
            },
            201
        )
);

app.put(
    '/connected-bank-accounts/:id',
    zValidator('param', z.object({ id: z.string() })),
    zValidator('json', CreateConnectedBankAccountSchema.partial()),
    async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            const data = c.req.valid('json');
            // Filter out null values to undefined
            const processedData = {
                ...data,
                accountNumber: data.accountNumber || undefined,
                iban: data.iban || undefined,
                routingNumber: data.routingNumber || undefined,
                currency: data.currency || undefined,
                customCsvConfig: data.customCsvConfig || undefined,
            };
            const account = await queries.updateConnectedBankAccount({ id, data: processedData });
            if (!account) {
                throw new Error('Connected bank account not found');
            }
            return account;
        })
);

// CSV Config Routes
app.get(
    '/global-bank-accounts/:id/csv-config',
    zValidator('param', z.object({ id: z.string() })),
    async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            return await queries.getGlobalBankAccountWithCsvConfig({ id });
        })
);

app.get(
    '/connected-bank-accounts/:id/csv-config',
    zValidator('param', z.object({ id: z.string() })),
    async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            return await queries.getConnectedBankAccountWithCsvConfig({ id });
        })
);

export default app;
