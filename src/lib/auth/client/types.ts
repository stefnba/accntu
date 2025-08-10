import { type auth } from '@/lib/auth/config';

export type TSocialProvider = keyof typeof auth.options.socialProviders;
