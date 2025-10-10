import { HTTP_STATUS_CODES } from '@/server/lib/errorNew/config';
import {
    createErrorRegistry,
    createPublicErrorRecord,
} from '@/server/lib/errorNew/registry/factory';

// ==================================================
// PUBLIC REGISTRY
// ==================================================

export const PUBLIC_ERROR_REGISTRY = createPublicErrorRecord({
    // Record not found
    NOT_FOUND: {
        message: 'Resource does not exist',
    },
    OPERATION_FAILED: {
        message: 'Operation failed',
    },
    ALREADY_EXISTS: {
        message: 'Resource already exists',
    },
});

// ==================================================
// PRIVATE REGISTRY
// ==================================================

export const ERROR_REGISTRY = createErrorRegistry({
    // Validation
    VALIDATION: {
        INVALID_INPUT: {
            layers: ['ENDPOINT'],
            public: PUBLIC_ERROR_REGISTRY.ALREADY_EXISTS,
            httpStatus: HTTP_STATUS_CODES.BAD_REQUEST,
        },
        MISSING_FIELD: {
            layers: ['ENDPOINT'],
            public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
            httpStatus: HTTP_STATUS_CODES.BAD_REQUEST,
        },
        INVALID_FORMAT: {
            layers: ['ENDPOINT'],
            public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
            httpStatus: HTTP_STATUS_CODES.BAD_REQUEST,
        },
    },

    // Resource
    RESOURCE: {
        NOT_FOUND: {
            layers: ['ENDPOINT', 'QUERY'],
            public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
            httpStatus: HTTP_STATUS_CODES.NOT_FOUND,
        },
        ALREADY_EXISTS: {
            layers: ['ENDPOINT', 'QUERY'],
            public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
            httpStatus: HTTP_STATUS_CODES.CONFLICT,
        },
    },

    // Operation
    OPERATION: {
        CREATE_FAILED: {
            layers: ['ENDPOINT', 'QUERY'],
            public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
            httpStatus: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        },
        UPDATE_FAILED: {
            layers: ['ENDPOINT', 'QUERY'],
            public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
            httpStatus: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        },
        DELETE_FAILED: {
            layers: ['ENDPOINT', 'QUERY'],
            public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
            httpStatus: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        },
    },

    PERMISSION: {
        NOT_AUTHORIZED: {
            layers: ['AUTH', 'ENDPOINT'],
            public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
            httpStatus: HTTP_STATUS_CODES.UNAUTHORIZED,
        },
        ACCESS_DENIED: {
            layers: ['AUTH', 'ENDPOINT'],
            public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
            httpStatus: HTTP_STATUS_CODES.FORBIDDEN,
        },
        INSUFFICIENT_ROLE: {
            layers: ['AUTH', 'ENDPOINT'],
            public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
            httpStatus: HTTP_STATUS_CODES.FORBIDDEN,
        },
    },
});
