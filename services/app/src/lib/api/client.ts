import { AppType } from '@server';
import { hc } from 'hono/client';

const API_URL = process.env.NEXT_PUBLIC_URL;

export const client = hc<AppType>(API_URL);
