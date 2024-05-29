import { getUser } from '@/server/auth/validate';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { getSignedS3Url } from './actions';
import { SignedS3UrlInputSchema } from './schema';

const app = new Hono().get(
    '/get-signed-url',
    zValidator('json', SignedS3UrlInputSchema),
    async (c) => {
        const user = getUser(c);
        const values = c.req.valid('json');
        const { url, key, bucket } = await getSignedS3Url(values, user.id);
        return c.json({ url, key, bucket });
    }
);

export default app;
