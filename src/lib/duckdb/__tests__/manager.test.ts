import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DuckDBConnectionError, DuckDBInitializationError, DuckDBQueryError } from '../errors';
import { DuckDBManager } from '../manager';
import type { CSVReadOptions, DuckDBConfig } from '../types';

// Mock the DuckDB module
vi.mock('@duckdb/node-api', () => ({
    DuckDBInstance: {
        create: vi.fn(),
    },
}));

describe('DuckDBManager', () => {
    let manager: DuckDBManager;
    let mockInstance: any;
    let mockConnection: any;

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Create mock objects
        mockConnection = {
            run: vi.fn(),
            streamAndRead: vi.fn(),
            getRowObjects: vi.fn().mockReturnValue([]),
            getColumns: vi.fn().mockReturnValue([]),
        };

        mockInstance = {
            connect: vi.fn().mockResolvedValue(mockConnection),
        };

        // Mock the result object
        const mockResult = {
            getRowObjects: vi.fn().mockResolvedValue([
                { id: 1, name: 'test1' },
                { id: 2, name: 'test2' },
            ]),
            getColumns: vi.fn().mockResolvedValue(['id', 'name']),
        };

        mockConnection.run.mockResolvedValue(mockResult);

        // Mock DuckDBInstance.create
        const { DuckDBInstance } = require('@duckdb/node-api');
        DuckDBInstance.create.mockResolvedValue(mockInstance);

        manager = new DuckDBManager();
    });

    afterEach(async () => {
        await manager.cleanup();
    });

    describe('constructor', () => {
        it('should create manager with default config', () => {
            const manager = new DuckDBManager();
            expect(manager.isInitialized()).toBe(false);
        });

        it('should create manager with custom config', () => {
            const config: DuckDBConfig = {
                database: 'test.db',
                enableHttpfs: false,
                s3: {
                    region: 'us-east-1',
                    accessKeyId: 'test-key',
                    secretAccessKey: 'test-secret',
                },
            };

            const manager = new DuckDBManager(config);
            expect(manager.isInitialized()).toBe(false);
        });
    });

    describe('initialize', () => {
        it('should initialize successfully with default config', async () => {
            await manager.initialize();

            expect(mockInstance.connect).toHaveBeenCalledTimes(1);
            expect(mockConnection.run).toHaveBeenCalledWith('INSTALL httpfs;');
            expect(mockConnection.run).toHaveBeenCalledWith('LOAD httpfs;');
            expect(manager.isInitialized()).toBe(true);
        });

        it('should initialize with S3 explicit credentials', async () => {
            const config: DuckDBConfig = {
                s3: {
                    region: 'us-east-1',
                    accessKeyId: 'test-key',
                    secretAccessKey: 'test-secret',
                },
            };

            manager = new DuckDBManager(config);
            await manager.initialize();

            expect(mockConnection.run).toHaveBeenCalledWith(
                expect.stringContaining('CREATE OR REPLACE SECRET default_s3_secret')
            );
        });

        it('should initialize with S3 credential chain', async () => {
            const config: DuckDBConfig = {
                s3: {
                    region: 'us-east-1',
                    useCredentialChain: true,
                },
            };

            manager = new DuckDBManager(config);
            await manager.initialize();

            expect(mockConnection.run).toHaveBeenCalledWith(
                expect.stringContaining('PROVIDER credential_chain')
            );
        });

        it('should throw DuckDBInitializationError on failure', async () => {
            const { DuckDBInstance } = require('@duckdb/node-api');
            DuckDBInstance.create.mockRejectedValueOnce(new Error('Instance creation failed'));

            await expect(manager.initialize()).rejects.toThrow(DuckDBInitializationError);
        });

        it('should skip httpfs installation when disabled', async () => {
            manager = new DuckDBManager({ enableHttpfs: false });
            await manager.initialize();

            expect(mockConnection.run).not.toHaveBeenCalledWith('INSTALL httpfs;');
            expect(mockConnection.run).not.toHaveBeenCalledWith('LOAD httpfs;');
        });
    });

    describe('query', () => {
        beforeEach(async () => {
            await manager.initialize();
        });

        it('should execute query successfully', async () => {
            const result = await manager.query('SELECT * FROM test');

            expect(mockConnection.run).toHaveBeenCalledWith('SELECT * FROM test', undefined);
            expect(result.rows).toHaveLength(2);
            expect(result.rowCount).toBe(2);
        });

        it('should execute query with parameters', async () => {
            const params = { id: 1 };
            await manager.query('SELECT * FROM test WHERE id = ?', params);

            expect(mockConnection.run).toHaveBeenCalledWith(
                'SELECT * FROM test WHERE id = ?',
                params
            );
        });

        it('should throw DuckDBConnectionError when not initialized', async () => {
            const uninitializedManager = new DuckDBManager();

            await expect(uninitializedManager.query('SELECT 1')).rejects.toThrow(
                DuckDBConnectionError
            );
        });

        it('should throw DuckDBQueryError on query failure', async () => {
            mockConnection.run.mockRejectedValueOnce(new Error('Query failed'));

            await expect(manager.query('INVALID SQL')).rejects.toThrow(DuckDBQueryError);
        });
    });

    describe('readCSVFromS3', () => {
        beforeEach(async () => {
            await manager.initialize();
        });

        it('should read CSV with auto-detection when no options provided', async () => {
            await manager.readCSVFromS3('s3://bucket/file.csv');

            expect(mockConnection.run).toHaveBeenCalledWith(
                "SELECT * FROM read_csv_auto('s3://bucket/file.csv')",
                undefined
            );
        });

        it('should read CSV with specific options', async () => {
            const options: CSVReadOptions = {
                delim: ';',
                header: true,
                skip: 1,
                encoding: 'UTF8',
            };

            await manager.readCSVFromS3('s3://bucket/file.csv', options);

            expect(mockConnection.run).toHaveBeenCalledWith(
                expect.stringContaining("SELECT * FROM read_csv('s3://bucket/file.csv'"),
                undefined
            );
            expect(mockConnection.run).toHaveBeenCalledWith(
                expect.stringContaining("delim = ';'"),
                undefined
            );
            expect(mockConnection.run).toHaveBeenCalledWith(
                expect.stringContaining('header = true'),
                undefined
            );
        });

        it('should handle multiple files', async () => {
            const files = ['s3://bucket/file1.csv', 's3://bucket/file2.csv'];
            await manager.readCSVFromS3(files);

            expect(mockConnection.run).toHaveBeenCalledWith(
                expect.stringContaining("['s3://bucket/file1.csv', 's3://bucket/file2.csv']"),
                undefined
            );
        });
    });

    describe('readParquetFromS3', () => {
        beforeEach(async () => {
            await manager.initialize();
        });

        it('should read Parquet files', async () => {
            await manager.readParquetFromS3('s3://bucket/file.parquet');

            expect(mockConnection.run).toHaveBeenCalledWith(
                "SELECT * FROM read_parquet('s3://bucket/file.parquet')",
                undefined
            );
        });

        it('should read Parquet with options', async () => {
            await manager.readParquetFromS3('s3://bucket/file.parquet', {
                hive_partitioning: true,
                filename: true,
            });

            expect(mockConnection.run).toHaveBeenCalledWith(
                expect.stringContaining('filename = true'),
                undefined
            );
            expect(mockConnection.run).toHaveBeenCalledWith(
                expect.stringContaining('hive_partitioning = true'),
                undefined
            );
        });
    });

    describe('createTableFromCSV', () => {
        beforeEach(async () => {
            await manager.initialize();
        });

        it('should create table with auto-detection', async () => {
            await manager.createTableFromCSV('test_table', 's3://bucket/file.csv');

            expect(mockConnection.run).toHaveBeenCalledWith(
                "CREATE TABLE test_table AS SELECT * FROM read_csv_auto('s3://bucket/file.csv')",
                undefined
            );
        });

        it('should create table with specific options', async () => {
            const options: CSVReadOptions = {
                delim: ',',
                header: true,
            };

            await manager.createTableFromCSV('test_table', 's3://bucket/file.csv', options);

            expect(mockConnection.run).toHaveBeenCalledWith(
                expect.stringContaining(
                    "CREATE TABLE test_table AS SELECT * FROM read_csv('s3://bucket/file.csv'"
                ),
                undefined
            );
        });
    });

    describe('transaction', () => {
        beforeEach(async () => {
            await manager.initialize();
        });

        it('should execute transaction successfully', async () => {
            const queries = [
                { sql: 'CREATE TABLE test (id INT)' },
                { sql: 'INSERT INTO test VALUES (1)' },
            ];

            await manager.transaction(queries);

            expect(mockConnection.run).toHaveBeenCalledWith('BEGIN TRANSACTION');
            expect(mockConnection.run).toHaveBeenCalledWith(
                'CREATE TABLE test (id INT)',
                undefined
            );
            expect(mockConnection.run).toHaveBeenCalledWith(
                'INSERT INTO test VALUES (1)',
                undefined
            );
            expect(mockConnection.run).toHaveBeenCalledWith('COMMIT');
        });

        it('should rollback on error', async () => {
            mockConnection.run
                .mockResolvedValueOnce(undefined) // BEGIN TRANSACTION
                .mockRejectedValueOnce(new Error('Query failed')); // First query fails

            const queries = [{ sql: 'INVALID SQL' }];

            await expect(manager.transaction(queries)).rejects.toThrow();
            expect(mockConnection.run).toHaveBeenCalledWith('ROLLBACK');
        });
    });

    describe('getInfo', () => {
        beforeEach(async () => {
            await manager.initialize();
        });

        it('should return database info', async () => {
            // Mock version query
            const versionResult = {
                getRowObjects: vi.fn().mockResolvedValue([{ version: 'v1.0.0' }]),
                getColumns: vi.fn().mockResolvedValue(['version']),
            };

            // Mock settings query
            const settingsResult = {
                getRowObjects: vi
                    .fn()
                    .mockResolvedValue([{ name: 's3_region', value: 'us-east-1' }]),
                getColumns: vi.fn().mockResolvedValue(['name', 'value']),
            };

            // Mock secrets query
            const secretsResult = {
                getRowObjects: vi
                    .fn()
                    .mockResolvedValue([
                        { name: 'default_s3_secret', type: 'S3', provider: 'config' },
                    ]),
                getColumns: vi.fn().mockResolvedValue(['name', 'type', 'provider']),
            };

            mockConnection.run
                .mockResolvedValueOnce(versionResult)
                .mockResolvedValueOnce(settingsResult)
                .mockResolvedValueOnce(secretsResult);

            const info = await manager.getInfo();

            expect(info.version).toBe('v1.0.0');
            expect(info.s3Settings).toHaveLength(1);
            expect(info.secrets).toHaveLength(1);
        });
    });

    describe('cleanup', () => {
        it('should cleanup resources', async () => {
            await manager.initialize();
            await manager.cleanup();

            expect(manager.isInitialized()).toBe(false);
        });
    });

    describe('error handling', () => {
        it('should handle S3 setup errors', async () => {
            const config: DuckDBConfig = {
                s3: {
                    accessKeyId: 'test-key',
                    secretAccessKey: 'test-secret',
                },
            };

            manager = new DuckDBManager(config);
            mockConnection.run.mockRejectedValueOnce(new Error('S3 setup failed'));

            await expect(manager.initialize()).rejects.toThrow(DuckDBInitializationError);
        });
    });
});
