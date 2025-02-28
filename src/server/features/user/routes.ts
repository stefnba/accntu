import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono()
    .get('/', (c) => c.json('list authors'))
    .post(
        '/',
        zValidator('json', z.object({ name: z.string(), email: z.string().email() })),
        (c) => {
            const { name } = c.req.valid('json');
            console.log(name);
            return c.json({ message: `create a user ${name}` }, 201);
        }
    )
    .get('/:id', zValidator('param', z.object({ id: z.string() })), (c) =>
        c.json({ id: c.req.param('id') })
    );

export default app;
