import { typedEntries } from '@/lib/utils';
import { TErrorCode } from '@/server/lib/error/registry';
import { APIError as BetterAuthAPIError } from 'better-auth/api';
import { _statusCode } from 'better-call';

/**
 * Maps a BetterAuthAPIError to our error code registry
 * @param error - The BetterAuthAPIError to map
 * @returns The error code from our registry
 */
export const mapBetterAuthErrorToErrorCode = (error: BetterAuthAPIError): TErrorCode => {
    let statusCode: keyof typeof _statusCode;

    if (typeof error.status === 'number') {
        statusCode =
            typedEntries(_statusCode).find(([_, value]) => value === error.status)?.[0] ||
            'INTERNAL_SERVER_ERROR';
    } else {
        statusCode = error.status;
    }

    switch (statusCode) {
        // todo: add more cases
        default:
            return 'AUTH.BETTER_AUTH_ERROR';
    }
};
