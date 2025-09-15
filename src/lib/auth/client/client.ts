import {
    customSessionClient,
    emailOTPClient,
    inferAdditionalFields,
    passkeyClient,
} from 'better-auth/client/plugins';

import { createAuthClient } from 'better-auth/react';
import type { auth } from '../config';

export const authClient = createAuthClient({
    plugins: [
        emailOTPClient(),
        customSessionClient<typeof auth>(),
        passkeyClient(),
        inferAdditionalFields<typeof auth>(),
    ],
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const authErrors = authClient.$ERROR_CODES;

// ====================
// Types
// ====================

export type TSession = typeof authClient.$Infer.Session.session;
export type TUser = typeof authClient.$Infer.Session.user;
export type TAuthSession = {
    user: TUser;
    session: TSession;
};
export type TErrorCodes = keyof typeof authErrors;
