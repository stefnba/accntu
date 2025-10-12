import { THttpStatusCodeMapping } from '@/server/lib/errorNew/error/types';

export const HTTP_STATUS_CODES = {
    // Success
    OK: 200,
    CREATED: 201,

    // Client errors
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,

    // Rate limit errors
    TOO_MANY_REQUESTS: 429,

    // Server errors
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
} satisfies THttpStatusCodeMapping;
