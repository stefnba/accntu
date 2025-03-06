// Log levels in order of severity
export const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
} as const;

export type LogLevel = keyof typeof LOG_LEVELS;

// Define all possible logging contexts
export const LOG_CONTEXTS = {
    // Application layers
    ROUTE: 'route',
    SERVICE: 'service',
    QUERY: 'query',

    // Features
    AUTH: 'auth',
    USER: 'user',

    // Infrastructure
    DATABASE: 'database',
    CACHE: 'cache',
    EMAIL: 'email',

    // HTTP
    REQUEST: 'request',
    RESPONSE: 'response',
    MIDDLEWARE: 'middleware',

    // Validation
    VALIDATION: 'validation',

    // System
    STARTUP: 'startup',
    SHUTDOWN: 'shutdown',
} as const;

export type LogContext = (typeof LOG_CONTEXTS)[keyof typeof LOG_CONTEXTS];

// Log message structure
export interface LogMessage {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: LogContext;
    data?: unknown;
    error?: {
        name: string;
        message: string;
        stack?: string;
        cause?: unknown;
    };
}

export interface LogOptions {
    context?: LogContext;
    data?: unknown;
    error?: Error;
}

export interface LoggerOptions {
    minLevel?: LogLevel;
    logToFile?: boolean;
    logDir?: string;
    suppressConsole?: boolean;
}
