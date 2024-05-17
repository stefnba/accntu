import { Hono } from 'hono';

const app = new Hono()
    .get('/logout', (c) => c.json('list authors'))
    .post('/login', (c) => c.json('create an author', 201));

export default app;
