import { DuckDBManager } from './manager';
import type { DuckDBConfig } from './types';

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
        const defaultConfig: DuckDBConfig = {
            database: ':memory:', // In-memory for fast processing
            enableHttpfs: true, // Enable S3 support
            s3: {
                useCredentialChain: true, // Use AWS credential chain
                region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
            },
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

export { DuckDBSingleton };
