import {
    customSessionClient,
    emailOTPClient,
    inferAdditionalFields,
    passkeyClient,
} from 'better-auth/client/plugins';

import { createAuthClient } from 'better-auth/react';
import type { auth } from '../config';

/**
 * Better-auth client
 */
export const authClient = createAuthClient({
    plugins: [
        emailOTPClient(),
        customSessionClient<typeof auth>(),
        passkeyClient(),
        inferAdditionalFields<typeof auth>(),
    ],
});

/**
 * Better-auth client error codes
 */
export const authErrors = authClient.$ERROR_CODES;

// ====================
// Types
// ====================

/**
 * Better-auth client session type
 */
export type TSession = typeof authClient.$Infer.Session.session;

/**
 * Better-auth client user type
 */
export type TUser = typeof authClient.$Infer.Session.user;

/**
 * Better-auth client auth session type
 */
export type TAuthSession = {
    user: TUser;
    session: TSession;
};

/**
 * Better-auth client error codes
 */
export type TErrorCodes = keyof typeof authErrors;
