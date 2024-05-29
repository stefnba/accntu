import { AppType } from '@/app/api/[[...route]]/route';
import { hc } from 'hono/client';

const API_URL = process.env.NEXT_PUBLIC_URL;

if (!API_URL) {
    throw new Error('NEXT_PUBLIC_URL is not defined');
}

export const client = hc<AppType>(API_URL);
