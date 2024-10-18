import { AppType } from '@/app/api/[[...route]]/route';
import { hc } from 'hono/client';

const API_URL = process.env.NEXT_PUBLIC_URL;

export const client = hc<AppType>(API_URL);
