import { auth } from '@/lib/auth/config';
import type { AuthContext } from '@/lib/auth/server/types';
import { Hono } from 'hono';

const router = new Hono<{ Bindings: AuthContext }>({
    strict: false,
});

router.on(['POST', 'GET'], '/auth/*', (c) => {
    return auth.handler(c.req.raw);
});

export default router;
