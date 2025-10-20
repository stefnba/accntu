import {
    type TAuthSession,
    type TErrorCodes,
    type TSession,
    type TUser,
} from '@/lib/auth/client/client';
import { type auth } from '@/lib/auth/config';

/**
 * Social provider type
 */
export type TSocialProvider = keyof typeof auth.options.socialProviders;

/**
 * Client session type
 */
export type TClientSessionReturn =
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
