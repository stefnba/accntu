import { customSessionClient, emailOTPClient, passkeyClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { auth } from '../config';

export const authClient = createAuthClient({
    plugins: [emailOTPClient(), customSessionClient<typeof auth>(), passkeyClient()],
});

export type TSession = typeof authClient.$Infer.Session.session;
export type TUser = typeof authClient.$Infer.Session.user;

const authErrors = authClient.$ERROR_CODES;
export type TErrorCodes = keyof typeof authErrors;
