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
            return await queries.searchGlobalBanks(query || '', country);
        } else {
            return await queries.getAllGlobalBanks();
        }
    })
);

app.get('/global-banks/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
    withRoute(c, async () => {
        const { id } = c.req.valid('param');
        const bank = await queries.getGlobalBankById(id);

        if (!bank) {
            throw new Error('Global bank not found');
        }

        return bank;
    })
);

app.get(
    '/global-banks/country/:country',
    zValidator('param', z.object({ country: z.string().length(2) })),
    async (c) =>
        withRoute(c, async () => {
            const { country } = c.req.valid('param');
            return await queries.getGlobalBanksByCountry(country);
        })
);

// Global Bank Accounts Routes
app.get(
    '/global-banks/:bankId/accounts',
    zValidator('param', z.object({ bankId: z.string() })),
    async (c) =>
        withRoute(c, async () => {
            const { bankId } = c.req.valid('param');
            return await queries.getGlobalBankAccountsByBankId(bankId);
        })
);

app.get('/global-bank-accounts/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
    withRoute(c, async () => {
        const { id } = c.req.valid('param');
        const account = await queries.getGlobalBankAccountById(id);

        if (!account) {
            throw new Error('Global bank account not found');
        }

        return account;
    })
);

// Connected Banks Routes
app.get(
    '/connected-banks/user/:userId',
    zValidator('param', z.object({ userId: z.string() })),
    async (c) =>
        withRoute(c, async () => {
            const { userId } = c.req.valid('param');
            return await queries.getConnectedBanksByUserId(userId);
        })
);

app.get('/connected-banks/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
    withRoute(c, async () => {
        const { id } = c.req.valid('param');
        const connectedBank = await queries.getConnectedBankById(id);

        if (!connectedBank) {
            throw new Error('Connected bank not found');
        }

        return connectedBank;
    })
);

app.post('/connected-banks', zValidator('json', CreateConnectedBankSchema), async (c) =>
    withRoute(
        c,
        async () => {
            const data = c.req.valid('json');
            return await queries.createConnectedBank(data);
        },
        201
    )
);

// Connected Bank Accounts Routes
app.get(
    '/connected-bank-accounts/user/:userId',
    zValidator('param', z.object({ userId: z.string() })),
    async (c) =>
        withRoute(c, async () => {
            const { userId } = c.req.valid('param');
            return await queries.getConnectedBankAccountsByUserId(userId);
        })
);

app.get(
    '/connected-bank-accounts/bank/:connectedBankId',
    zValidator('param', z.object({ connectedBankId: z.string() })),
    async (c) =>
        withRoute(c, async () => {
            const { connectedBankId } = c.req.valid('param');
            return await queries.getConnectedBankAccountsByConnectedBankId(connectedBankId);
        })
);

app.get(
    '/connected-bank-accounts/:id',
    zValidator('param', z.object({ id: z.string() })),
    async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            const account = await queries.getConnectedBankAccountById(id);

            if (!account) {
                throw new Error('Connected bank account not found');
            }

            return account;
        })
);

app.get(
    '/connected-bank-accounts/:id/csv-config',
    zValidator('param', z.object({ id: z.string() })),
    async (c) =>
        withRoute(c, async () => {
            const { id } = c.req.valid('param');
            const account = await queries.getConnectedBankAccountWithCsvConfig(id);

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
                // Cast the data to match the expected query interface
                const queryData = {
                    ...data,
                    accountNumber: data.accountNumber || undefined,
                    iban: data.iban || undefined,
                    routingNumber: data.routingNumber || undefined,
                    currency: data.currency || undefined,
                    customCsvConfig: data.customCsvConfig || undefined,
                };
                return await queries.createConnectedBankAccount(queryData);
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

            // Cast the data to match the expected query interface
            const queryData = {
                ...data,
                accountNumber: data.accountNumber === null ? undefined : data.accountNumber,
                iban: data.iban === null ? undefined : data.iban,
                routingNumber: data.routingNumber === null ? undefined : data.routingNumber,
                currency: data.currency === null ? undefined : data.currency,
                customCsvConfig: data.customCsvConfig === null ? undefined : data.customCsvConfig,
            };

            const updatedAccount = await queries.updateConnectedBankAccount(id, queryData);

            if (!updatedAccount) {
                throw new Error('Connected bank account not found');
            }

            return updatedAccount;
        })
);

export default app;
