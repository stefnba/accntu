import { app } from '@/server';
import { handle } from 'hono/vercel';

export const preferredRegion = 'auto';
export const dynamic = 'force-dynamic';

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const PUT = handle(app);
