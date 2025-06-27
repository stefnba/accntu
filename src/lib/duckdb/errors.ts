export class DuckDBError extends Error {
    constructor(
        message: string,
        public readonly originalError?: Error
    ) {
        super(message);
        this.name = 'DuckDBError';
    }
}

export class DuckDBInitializationError extends DuckDBError {
    constructor(message: string, originalError?: Error) {
        super(`DuckDB initialization failed: ${message}`, originalError);
        this.name = 'DuckDBInitializationError';
    }
}

export class DuckDBQueryError extends DuckDBError {
    constructor(
        message: string,
        public readonly query?: string,
        originalError?: Error
    ) {
        super(`Query execution failed: ${message}`, originalError);
        this.name = 'DuckDBQueryError';
    }
}

export class DuckDBConnectionError extends DuckDBError {
    constructor(message: string, originalError?: Error) {
        super(`Connection error: ${message}`, originalError);
        this.name = 'DuckDBConnectionError';
    }
}

export class DuckDBS3Error extends DuckDBError {
    constructor(message: string, originalError?: Error) {
        super(`S3 operation failed: ${message}`, originalError);
        this.name = 'DuckDBS3Error';
    }
}

export class DuckDBTransactionError extends DuckDBError {
    constructor(message: string, originalError?: Error) {
        super(`Transaction failed: ${message}`, originalError);
        this.name = 'DuckDBTransactionError';
    }
}
