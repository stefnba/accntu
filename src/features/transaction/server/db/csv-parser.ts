// import { Database } from 'duckdb-async'; // TODO: Install duckdb-async package
import { getConnectedBankAccountWithCsvConfig } from '../../../bank/server/db/queries';
import type { ConnectedBankAccount, GlobalBankAccount } from '../../../bank/server/db/schema';

export interface ParsedTransaction {
    date: string;
    description: string;
    amount: number;
    balance?: number;
    reference?: string;
    counterparty?: string;
    iban?: string;
    bic?: string;
    category?: string;
    rawData: Record<string, any>;
}

export interface CsvParseResult {
    transactions: ParsedTransaction[];
    totalRecords: number;
    successfulRecords: number;
    errors: Array<{
        line?: number;
        field?: string;
        message: string;
        rawData?: any;
    }>;
}

// Temporary interface until duckdb-async is installed
interface DuckDbDatabase {
    all(query: string): Promise<any[]>;
    get(query: string): Promise<any>;
    run(query: string): Promise<void>;
    close(): Promise<void>;
}

export class DuckDbCsvParser {
    private db: DuckDbDatabase | null = null;

    async initialize(): Promise<void> {
        // TODO: Uncomment when duckdb-async is installed
        // const { Database } = await import('duckdb-async');
        // if (!this.db) {
        //   this.db = await Database.create(':memory:');
        // }
        throw new Error('DuckDB not installed. Run: bun add duckdb-async');
    }

    async close(): Promise<void> {
        if (this.db) {
            await this.db.close();
            this.db = null;
        }
    }

    /**
     * Parse CSV file using DuckDB SQL query from globalBankAccount
     */
    async parseCsvFile(
        connectedBankAccountId: string,
        csvFilePath: string
    ): Promise<CsvParseResult> {
        await this.initialize();

        if (!this.db) {
            throw new Error('Failed to initialize DuckDB');
        }

        // Get account configuration with CSV parsing settings
        const accountConfig = await getConnectedBankAccountWithCsvConfig(connectedBankAccountId);
        if (!accountConfig) {
            throw new Error('Connected bank account not found');
        }

        // Determine which DuckDB query to use
        const duckdbQuery = this.getDuckDbQuery(accountConfig);
        if (!duckdbQuery) {
            throw new Error('No DuckDB query configured for this account');
        }

        try {
            // Replace placeholder in query with actual file path
            const finalQuery = duckdbQuery.replace('{{CSV_FILE_PATH}}', csvFilePath);

            // Execute the DuckDB query
            const rawResults = await this.db.all(finalQuery);

            // Process and validate results
            const parseResult = this.processResults(rawResults, accountConfig);

            return parseResult;
        } catch (error) {
            throw new Error(
                `CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Parse CSV content directly (for testing or small files)
     */
    async parseCsvContent(
        connectedBankAccountId: string,
        csvContent: string,
        fileName: string = 'temp.csv'
    ): Promise<CsvParseResult> {
        await this.initialize();

        if (!this.db) {
            throw new Error('Failed to initialize DuckDB');
        }

        const accountConfig = await getConnectedBankAccountWithCsvConfig(connectedBankAccountId);
        if (!accountConfig) {
            throw new Error('Connected bank account not found');
        }

        const duckdbQuery = this.getDuckDbQuery(accountConfig);
        if (!duckdbQuery) {
            throw new Error('No DuckDB query configured for this account');
        }

        try {
            // Create a temporary table with the CSV content
            const tempTableName = `temp_csv_${Date.now()}`;

            // First, create table from CSV content
            const transformConfig = this.getCsvConfig(accountConfig);
            const createTableQuery = `
        CREATE TABLE ${tempTableName} AS
        SELECT * FROM read_csv_auto('data:text/csv;base64,${Buffer.from(csvContent).toString('base64')}',
          delimiter='${transformConfig.delimiter}',
          header=${transformConfig.hasHeader},
          quote='${transformConfig.quoteChar}',
          escape='${transformConfig.escapeChar}'
        )
      `;

            await this.db.run(createTableQuery);

            // Replace CSV_FILE_PATH placeholder with table name
            const finalQuery = duckdbQuery.replace('{{CSV_FILE_PATH}}', tempTableName);

            // Execute the parsing query
            const rawResults = await this.db.all(finalQuery);

            // Clean up temp table
            await this.db.run(`DROP TABLE ${tempTableName}`);

            // Process results
            const parseResult = this.processResults(rawResults, accountConfig);

            return parseResult;
        } catch (error) {
            throw new Error(
                `CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Get the appropriate DuckDB query for the account
     */
    private getDuckDbQuery(
        accountConfig: ConnectedBankAccount & { globalBankAccount?: GlobalBankAccount }
    ): string | null {
        // Check for custom override first
        if (accountConfig.customCsvConfig?.duckdbQuery) {
            return accountConfig.customCsvConfig.duckdbQuery;
        }

        // Fall back to global bank account template
        if (accountConfig.globalBankAccount?.duckdbQuery) {
            return accountConfig.globalBankAccount.duckdbQuery;
        }

        return null;
    }

    /**
     * Get CSV configuration for DuckDB
     */
    private getCsvConfig(
        accountConfig: ConnectedBankAccount & { globalBankAccount?: GlobalBankAccount }
    ) {
        const defaultConfig = {
            delimiter: ',',
            hasHeader: true,
            quoteChar: '"',
            escapeChar: '"',
            encoding: 'utf-8',
        };

        // Merge custom config if available
        const customConfig = accountConfig.customCsvConfig?.transformConfig || {};
        const globalConfig = accountConfig.globalBankAccount?.transformConfig || {};

        return {
            ...defaultConfig,
            ...globalConfig,
            ...customConfig,
        };
    }

    /**
     * Process raw DuckDB results into standardized transaction format
     */
    private processResults(
        rawResults: any[],
        accountConfig: ConnectedBankAccount & { globalBankAccount?: GlobalBankAccount }
    ): CsvParseResult {
        const transactions: ParsedTransaction[] = [];
        const errors: CsvParseResult['errors'] = [];

        for (let i = 0; i < rawResults.length; i++) {
            const row = rawResults[i];

            try {
                // Validate required fields
                if (!row.date || !row.description || row.amount === undefined) {
                    errors.push({
                        line: i + 1,
                        message: 'Missing required fields (date, description, or amount)',
                        rawData: row,
                    });
                    continue;
                }

                // Parse and validate date
                const transactionDate = new Date(row.date);
                if (isNaN(transactionDate.getTime())) {
                    errors.push({
                        line: i + 1,
                        field: 'date',
                        message: 'Invalid date format',
                        rawData: row,
                    });
                    continue;
                }

                // Parse amount
                const amount = parseFloat(row.amount);
                if (isNaN(amount)) {
                    errors.push({
                        line: i + 1,
                        field: 'amount',
                        message: 'Invalid amount format',
                        rawData: row,
                    });
                    continue;
                }

                // Create parsed transaction
                const transaction: ParsedTransaction = {
                    date: transactionDate.toISOString(),
                    description: row.description,
                    amount: amount,
                    balance: row.balance ? parseFloat(row.balance) : undefined,
                    reference: row.reference || undefined,
                    counterparty: row.counterparty || undefined,
                    iban: row.iban || undefined,
                    bic: row.bic || undefined,
                    category: row.category || undefined,
                    rawData: row,
                };

                transactions.push(transaction);
            } catch (error) {
                errors.push({
                    line: i + 1,
                    message: error instanceof Error ? error.message : 'Unknown processing error',
                    rawData: row,
                });
            }
        }

        return {
            transactions,
            totalRecords: rawResults.length,
            successfulRecords: transactions.length,
            errors,
        };
    }

    /**
     * Validate CSV file before processing
     */
    async validateCsvFile(filePath: string): Promise<{
        isValid: boolean;
        errors: string[];
        rowCount?: number;
        columnCount?: number;
        sampleRows?: any[];
    }> {
        await this.initialize();

        if (!this.db) {
            throw new Error('Failed to initialize DuckDB');
        }

        try {
            // Get basic file info
            const infoQuery = `
        SELECT COUNT(*) as row_count
        FROM read_csv_auto('${filePath}', sample_size=1000)
      `;

            const info = await this.db.get(infoQuery);

            // Get sample rows for preview
            const sampleQuery = `
        SELECT * FROM read_csv_auto('${filePath}', sample_size=5)
        LIMIT 5
      `;

            const sampleRows = await this.db.all(sampleQuery);

            return {
                isValid: true,
                errors: [],
                rowCount: info?.row_count || 0,
                columnCount: sampleRows.length > 0 ? Object.keys(sampleRows[0]).length : 0,
                sampleRows,
            };
        } catch (error) {
            return {
                isValid: false,
                errors: [error instanceof Error ? error.message : 'Unknown validation error'],
            };
        }
    }
}

// Example DuckDB queries for different bank formats
export const EXAMPLE_DUCKDB_QUERIES = {
    // Standard CSV with single amount column
    STANDARD_FORMAT: `
    SELECT
      strptime(date_col, '%Y-%m-%d') as date,
      description_col as description,
      CAST(amount_col as DECIMAL(12,2)) as amount,
      CAST(balance_col as DECIMAL(12,2)) as balance,
      reference_col as reference,
      counterparty_col as counterparty
    FROM read_csv_auto('{{CSV_FILE_PATH}}',
      delimiter=',',
      header=true,
      quote='"'
    )
    WHERE date_col IS NOT NULL
      AND description_col IS NOT NULL
      AND amount_col IS NOT NULL
    ORDER BY date_col DESC
  `,

    // Bank with separate debit/credit columns
    DEBIT_CREDIT_FORMAT: `
    SELECT
      strptime(date_col, '%d/%m/%Y') as date,
      description_col as description,
      CASE
        WHEN debit_col IS NOT NULL AND debit_col != '' THEN -CAST(debit_col as DECIMAL(12,2))
        WHEN credit_col IS NOT NULL AND credit_col != '' THEN CAST(credit_col as DECIMAL(12,2))
        ELSE 0
      END as amount,
      CAST(balance_col as DECIMAL(12,2)) as balance,
      reference_col as reference,
      counterparty_col as counterparty
    FROM read_csv_auto('{{CSV_FILE_PATH}}',
      delimiter=';',
      header=true,
      quote='"'
    )
    WHERE date_col IS NOT NULL
      AND description_col IS NOT NULL
      AND (debit_col IS NOT NULL OR credit_col IS NOT NULL)
    ORDER BY date_col DESC
  `,

    // European format with comma decimal separator
    EUROPEAN_FORMAT: `
    SELECT
      strptime(date_col, '%d.%m.%Y') as date,
      description_col as description,
      CAST(REPLACE(amount_col, ',', '.') as DECIMAL(12,2)) as amount,
      CAST(REPLACE(balance_col, ',', '.') as DECIMAL(12,2)) as balance,
      reference_col as reference,
      counterparty_col as counterparty
    FROM read_csv_auto('{{CSV_FILE_PATH}}',
      delimiter=';',
      header=true,
      quote='"'
    )
    WHERE date_col IS NOT NULL
      AND description_col IS NOT NULL
      AND amount_col IS NOT NULL
    ORDER BY date_col DESC
  `,
};

export default DuckDbCsvParser;
