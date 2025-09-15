import {
    type TAuthSession,
    type TErrorCodes,
    type TSession,
    type TUser,
} from '@/lib/auth/client/client';
import { type auth } from '@/lib/auth/config';

export type TSocialProvider = keyof typeof auth.options.socialProviders;

export type TClientSession =
    // Authenticated
    | {
          isAuthenticated: true;
          user: TUser;
          session: TSession;
          isLoading: boolean;
          error: null;
          refetchSession: () => void;
      }
    // Not authenticated
    | {
          isAuthenticated: false;
          user: null;
          session: null;
          isLoading: boolean;
          error: Error | null;
          refetchSession: () => void;
      };

export { TAuthSession, TErrorCodes, TSession, TUser };
