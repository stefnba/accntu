import { getEnv } from '@/lib/env';
import { AppType } from '@/server/index';
import { hc } from 'hono/client';

const { NEXT_PUBLIC_APP_URL } = getEnv('client');

export const apiClient = hc<AppType>(NEXT_PUBLIC_APP_URL).api;
