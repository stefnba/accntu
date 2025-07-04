import { DuckDBTransactionTransformManager } from '@/lib/duckdb/transaction-transform-manager';
import { getEnv } from '@/lib/env';
import { DuckDBCore as DuckDBManager } from './core';
import type { DuckDBConfig } from './types';

/**
 * Singleton class for the DuckDB instance
 * This class is used to get the DuckDB instance and initialize it if it doesn't exist
 * It is also used to reset the instance and cleanup the database
 * It is also used to get the instance if it exists without initializing
 */
class DuckDBSingleton {
    private static instance: DuckDBManager | null = null;
    private static isInitializing = false;
    private static initPromise: Promise<DuckDBManager> | null = null;

    /**
     * Get or create the DuckDB instance
     * Thread-safe initialization with promise caching
     */
    static async getInstance(config?: DuckDBConfig): Promise<DuckDBManager> {
        // If we already have an initialized instance, return it
        if (this.instance && this.instance.isInitialized()) {
            return this.instance;
        }

        // If we're already initializing, wait for that promise
        if (this.isInitializing && this.initPromise) {
            return this.initPromise;
        }

        // Start initialization
        this.isInitializing = true;
        this.initPromise = this.initializeInstance(config);

        try {
            this.instance = await this.initPromise;
            return this.instance;
        } finally {
            this.isInitializing = false;
            this.initPromise = null;
        }
    }

    private static async initializeInstance(config?: DuckDBConfig): Promise<DuckDBManager> {
        let env: ReturnType<typeof getEnv>;
        try {
            env = getEnv();
        } catch (error) {
            // If env validation fails, create minimal config without PostgreSQL extension
            console.warn(
                'Environment validation failed, creating DuckDB without PostgreSQL extension:',
                error
            );
            const fallbackConfig: DuckDBConfig = {
                database: ':memory:',
                s3: {
                    useCredentialChain: true,
                    region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
                },
            };
            const finalConfig = { ...fallbackConfig, ...config };
            const manager = new DuckDBManager(finalConfig);
            await manager.initialize();
            manager.setupCleanupHandlers();
            return manager;
        }

        const enablePostgres = Boolean(process.env.ENABLE_DUCKDB_POSTGRES_EXTENSION);

        const defaultConfig: DuckDBConfig = {
            database: ':memory:', // In-memory for fast processing
            s3: {
                useCredentialChain: true, // Use AWS credential chain
                region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
            },
            postgres: enablePostgres
                ? {
                      connectionString: env.DATABASE_URL,
                      connectionLimit: 10,
                      timeout: 30000,
                  }
                : undefined,
        };

        const finalConfig = { ...defaultConfig, ...config };
        const manager = new DuckDBManager(finalConfig);

        await manager.initialize();
        manager.setupCleanupHandlers();

        return manager;
    }

    /**
     * Force cleanup and reset (useful for testing or error recovery)
     */
    static async reset(): Promise<void> {
        if (this.instance) {
            await this.instance.cleanup();
            this.instance = null;
        }
        this.isInitializing = false;
        this.initPromise = null;
    }

    /**
     * Get instance if it exists without initializing
     */
    static getInstanceSync(): DuckDBManager | null {
        return this.instance;
    }
}

/**
 * Singleton class for the DuckDBTransactionTransformManager instance.
 * This class ensures a single, shared instance of the manager is used throughout
 * the application, handling initialization and cleanup gracefully. It's designed
 * to be thread-safe for initialization.
 */
class DuckDBTransactionTransformSingleton {
    private static instance: DuckDBTransactionTransformManager | null = null;
    private static isInitializing = false;
    private static initPromise: Promise<DuckDBTransactionTransformManager> | null = null;

    /**
     * Get or create the DuckDBTransactionTransformManager instance.
     * Thread-safe initialization with promise caching.
     */
    static async getInstance(config?: DuckDBConfig): Promise<DuckDBTransactionTransformManager> {
        // If we already have an initialized instance, return it
        if (this.instance && this.instance.isInitialized()) {
            return this.instance;
        }

        // If we're already initializing, wait for that promise
        if (this.isInitializing && this.initPromise) {
            return this.initPromise;
        }

        // Start initialization
        this.isInitializing = true;
        this.initPromise = this.initializeInstance(config);

        try {
            this.instance = await this.initPromise;
            return this.instance;
        } finally {
            this.isInitializing = false;
            this.initPromise = null;
        }
    }

    private static async initializeInstance(
        config?: DuckDBConfig
    ): Promise<DuckDBTransactionTransformManager> {
        let env: ReturnType<typeof getEnv>;
        try {
            env = getEnv();
        } catch (error) {
            // If env validation fails, create minimal config without PostgreSQL extension
            console.warn(
                'Environment validation failed, creating DuckDB without PostgreSQL extension:',
                error
            );
            const fallbackConfig: DuckDBConfig = {
                database: ':memory:',
                s3: {
                    useCredentialChain: true,
                    region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
                },
                postgres: {
                    connectionString: process.env.DATABASE_URL!,
                    connectionLimit: 10,
                    timeout: 30000,
                },
            };
            const finalConfig = { ...fallbackConfig, ...config };
            const manager = new DuckDBTransactionTransformManager(finalConfig);
            await manager.initialize();
            manager.setupCleanupHandlers();
            return manager;
        }

        const defaultConfig: DuckDBConfig = {
            database: ':memory:', // In-memory for fast processing
            s3: {
                useCredentialChain: true, // Use AWS credential chain
                region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
            },
            postgres: {
                connectionString: env.DATABASE_URL,
                connectionLimit: 10,
                timeout: 30000,
            },
        };

        const finalConfig = { ...defaultConfig, ...config };
        const manager = new DuckDBTransactionTransformManager(finalConfig);

        await manager.initialize();
        manager.setupCleanupHandlers();

        return manager;
    }

    /**
     * Force cleanup and reset (useful for testing or error recovery)
     */
    static async reset(): Promise<void> {
        if (this.instance) {
            await this.instance.cleanup();
            this.instance = null;
        }
        this.isInitializing = false;
        this.initPromise = null;
    }

    /**
     * Get instance if it exists without initializing
     */
    static getInstanceSync(): DuckDBTransactionTransformManager | null {
        return this.instance;
    }
}

export { DuckDBSingleton, DuckDBTransactionTransformSingleton };
