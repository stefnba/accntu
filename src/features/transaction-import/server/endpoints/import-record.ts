import { getUser } from '@/lib/auth';
import { withRoute } from '@/server/lib/handler';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import * as importRecordServices from '../db/services/import-record';

const app = new Hono();

const CreateTransactionImportSchema = z.object({
    connectedBankAccountId: z.string().min(1, 'Connected bank account ID is required'),
});

const UpdateTransactionImportSchema = z.object({
    status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
});

app.get('/', async (c) =>
    withRoute(c, async () => {
        const user = getUser(c);
        return await importRecordServices.getAllImports({ userId: user.id });
    })
);

app.get('/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
    withRoute(c, async () => {
        const user = getUser(c);
        const { id } = c.req.valid('param');
        
        return await importRecordServices.getImportById({ id, userId: user.id });
    })
);

app.post('/', zValidator('json', CreateTransactionImportSchema), async (c) =>
    withRoute(c, async () => {
        const user = getUser(c);
        const data = c.req.valid('json');
        
        return await importRecordServices.createTransactionImport({
            userId: user.id,
            connectedBankAccountId: data.connectedBankAccountId,
        });
    }, 201)
);

app.put('/:id', 
    zValidator('param', z.object({ id: z.string() })),
    zValidator('json', UpdateTransactionImportSchema),
    async (c) =>
        withRoute(c, async () => {
            const user = getUser(c);
            const { id } = c.req.valid('param');
            const data = c.req.valid('json');
            
            return await importRecordServices.updateImport({
                id,
                userId: user.id,
                data,
            });
        })
);

app.delete('/:id', zValidator('param', z.object({ id: z.string() })), async (c) =>
    withRoute(c, async () => {
        const user = getUser(c);
        const { id } = c.req.valid('param');
        
        return await importRecordServices.deleteImport({ 
            importId: id, 
            userId: user.id 
        });
    })
);

export default app;