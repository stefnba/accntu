import { Hono } from 'hono';

const app = new Hono()
    .get('/logout', (c) => c.json('Logout', 201))
    .post('/login', (c) => c.json('Login', 201));

export default app;
