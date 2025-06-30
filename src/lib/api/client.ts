import { AppType } from '@/server/index';
import { hc } from 'hono/client';

const API_URL = process.env.NEXT_PUBLIC_APP_URL;

if (!API_URL) {
    throw new Error('NEXT_PUBLIC_APP_URL is not set');
}

export const apiClient = hc<AppType>(API_URL).api;
