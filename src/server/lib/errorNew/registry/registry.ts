import { HTTP_STATUS_CODES } from '@/server/lib/errorNew/config';
import { ErrorRegistry, createPublicErrorRecord } from '@/server/lib/errorNew/registry/factory';
import {
    InferErrorCategoriesFromRegistry,
    InferErrorKeysFromRegistry,
} from '@/server/lib/errorNew/registry/types';

// ==================================================
// PUBLIC REGISTRY
// ==================================================

export const PUBLIC_ERROR_REGISTRY = createPublicErrorRecord({
    // Operation
    OPERATION_FAILED: {
        message: 'Operation failed',
        httpStatus: HTTP_STATUS_CODES.BAD_REQUEST,
    },

    // Resource
    NOT_FOUND: {
        message: 'Resource does not exist',
        httpStatus: HTTP_STATUS_CODES.NOT_FOUND,
    },
    ALREADY_EXISTS: {
        message: 'Resource already exists',
        httpStatus: HTTP_STATUS_CODES.CONFLICT,
    },

    // Permission
    UNAUTHORIZED: {
        message: 'Unauthorized',
        httpStatus: HTTP_STATUS_CODES.UNAUTHORIZED,
    },
    FORBIDDEN: {
        message: 'Forbidden',
        httpStatus: HTTP_STATUS_CODES.FORBIDDEN,
    },

    // Validation
    INVALID_INPUT: {
        message: 'Invalid input',
        httpStatus: HTTP_STATUS_CODES.BAD_REQUEST,
    },
    MISSING_FIELD: {
        message: 'Missing field',
        httpStatus: HTTP_STATUS_CODES.BAD_REQUEST,
    },
    INVALID_FORMAT: {
        message: 'Invalid format',
        httpStatus: HTTP_STATUS_CODES.BAD_REQUEST,
    },

    // Rate limit
    TOO_MANY_REQUESTS: {
        message: 'Too many requests',
        httpStatus: HTTP_STATUS_CODES.TOO_MANY_REQUESTS,
    },

    // Server
    INTERNAL_ERROR: {
        message: 'Internal server error',
        httpStatus: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    },
});

// ==================================================
// PRIVATE REGISTRY
// ==================================================

export const ERROR_REGISTRY = ErrorRegistry.fromObject({
    // Validation
    VALIDATION: {
        INVALID_INPUT: {
            layers: ['ENDPOINT'],
            public: PUBLIC_ERROR_REGISTRY.INVALID_INPUT,
            isExpected: true,
        },
        MISSING_FIELD: {
            layers: ['ENDPOINT'],
            public: PUBLIC_ERROR_REGISTRY.MISSING_FIELD,
            isExpected: true,
        },
        INVALID_FORMAT: {
            layers: ['ENDPOINT'],
            public: PUBLIC_ERROR_REGISTRY.INVALID_FORMAT,
            isExpected: true,
        },
    },

    // Resource
    RESOURCE: {
        NOT_FOUND: {
            layers: ['ENDPOINT', 'QUERY'],
            public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
            httpStatus: HTTP_STATUS_CODES.NOT_FOUND,
            isExpected: true,
        },
        ALREADY_EXISTS: {
            layers: ['ENDPOINT', 'QUERY'],
            public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
            httpStatus: HTTP_STATUS_CODES.CONFLICT,
            isExpected: true,
        },
    },

    // Operation
    OPERATION: {
        CREATE_FAILED: {
            layers: ['ENDPOINT', 'QUERY'],
            public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
            httpStatus: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            isExpected: false,
        },
        UPDATE_FAILED: {
            layers: ['ENDPOINT', 'QUERY'],
            public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
            httpStatus: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            isExpected: false,
        },
        DELETE_FAILED: {
            layers: ['ENDPOINT', 'QUERY'],
            public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
            httpStatus: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
            isExpected: false,
        },
    },

    PERMISSION: {
        NOT_AUTHORIZED: {
            layers: ['AUTH', 'ENDPOINT'],
            public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
            httpStatus: HTTP_STATUS_CODES.UNAUTHORIZED,
            isExpected: true,
        },
        ACCESS_DENIED: {
            layers: ['AUTH', 'ENDPOINT'],
            public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
            httpStatus: HTTP_STATUS_CODES.FORBIDDEN,
            isExpected: true,
        },
        INSUFFICIENT_ROLE: {
            layers: ['AUTH', 'ENDPOINT'],
            public: PUBLIC_ERROR_REGISTRY.NOT_FOUND,
            httpStatus: HTTP_STATUS_CODES.FORBIDDEN,
            isExpected: true,
        },
    },

    SERVER: {
        INTERNAL_ERROR: {
            public: PUBLIC_ERROR_REGISTRY.INTERNAL_ERROR,
            isExpected: false,
        },
        SERVICE_UNAVAILABLE: {
            public: PUBLIC_ERROR_REGISTRY.INTERNAL_ERROR,

            isExpected: false,
        },
        MAINTENANCE_MODE: {
            public: PUBLIC_ERROR_REGISTRY.INTERNAL_ERROR,
            isExpected: false,
        },
    },
});

export type TErrorKeys = InferErrorKeysFromRegistry<typeof ERROR_REGISTRY.registry>;
export type TErrorCategories = InferErrorCategoriesFromRegistry<typeof ERROR_REGISTRY.registry>;
