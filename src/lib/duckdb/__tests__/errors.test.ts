import { describe, expect, it } from 'vitest';
import {
    DuckDBConnectionError,
    DuckDBError,
    DuckDBInitializationError,
    DuckDBQueryError,
    DuckDBS3Error,
    DuckDBTransactionError,
} from '../errors';

describe('DuckDB Error Classes', () => {
    describe('DuckDBError', () => {
        it('should create error with message', () => {
            const error = new DuckDBError('Test error');

            expect(error.message).toBe('Test error');
            expect(error.name).toBe('DuckDBError');
            expect(error).toBeInstanceOf(Error);
        });

        it('should create error with original error', () => {
            const originalError = new Error('Original error');
            const error = new DuckDBError('Test error', originalError);

            expect(error.message).toBe('Test error');
            expect(error.originalError).toBe(originalError);
        });
    });

    describe('DuckDBInitializationError', () => {
        it('should create initialization error', () => {
            const error = new DuckDBInitializationError('Init failed');

            expect(error.message).toBe('DuckDB initialization failed: Init failed');
            expect(error.name).toBe('DuckDBInitializationError');
            expect(error).toBeInstanceOf(DuckDBError);
        });

        it('should create initialization error with original error', () => {
            const originalError = new Error('Original error');
            const error = new DuckDBInitializationError('Init failed', originalError);

            expect(error.originalError).toBe(originalError);
        });
    });

    describe('DuckDBQueryError', () => {
        it('should create query error', () => {
            const error = new DuckDBQueryError('Query failed');

            expect(error.message).toBe('Query execution failed: Query failed');
            expect(error.name).toBe('DuckDBQueryError');
            expect(error).toBeInstanceOf(DuckDBError);
        });

        it('should create query error with SQL query', () => {
            const sql = 'SELECT * FROM test';
            const error = new DuckDBQueryError('Query failed', sql);

            expect(error.query).toBe(sql);
        });

        it('should create query error with original error', () => {
            const originalError = new Error('Original error');
            const error = new DuckDBQueryError('Query failed', 'SELECT 1', originalError);

            expect(error.originalError).toBe(originalError);
        });
    });

    describe('DuckDBConnectionError', () => {
        it('should create connection error', () => {
            const error = new DuckDBConnectionError('Connection failed');

            expect(error.message).toBe('Connection error: Connection failed');
            expect(error.name).toBe('DuckDBConnectionError');
            expect(error).toBeInstanceOf(DuckDBError);
        });
    });

    describe('DuckDBS3Error', () => {
        it('should create S3 error', () => {
            const error = new DuckDBS3Error('S3 operation failed');

            expect(error.message).toBe('S3 operation failed: S3 operation failed');
            expect(error.name).toBe('DuckDBS3Error');
            expect(error).toBeInstanceOf(DuckDBError);
        });
    });

    describe('DuckDBTransactionError', () => {
        it('should create transaction error', () => {
            const error = new DuckDBTransactionError('Transaction failed');

            expect(error.message).toBe('Transaction failed: Transaction failed');
            expect(error.name).toBe('DuckDBTransactionError');
            expect(error).toBeInstanceOf(DuckDBError);
        });
    });

    describe('Error inheritance', () => {
        it('should maintain Error prototype chain', () => {
            const errors = [
                new DuckDBError('test'),
                new DuckDBInitializationError('test'),
                new DuckDBQueryError('test'),
                new DuckDBConnectionError('test'),
                new DuckDBS3Error('test'),
                new DuckDBTransactionError('test'),
            ];

            errors.forEach((error) => {
                expect(error).toBeInstanceOf(Error);
                expect(error).toBeInstanceOf(DuckDBError);
                expect(error.stack).toBeDefined();
            });
        });
    });
});
