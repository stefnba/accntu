import { importRecordServices } from '@/features/transaction-import/server/services/import-record';

/**
 * Cleanup service for transaction imports
 */
export class TransactionImportCleanupService {
    /**
     * Clean up draft imports older than specified hours
     * @param olderThanHours - Hours threshold (default: 24)
     * @returns Number of imports cleaned up
     */
    static async cleanupOldDraftImports(olderThanHours: number = 24): Promise<number> {
        try {
            const cleanedUpCount =
                await importRecordServices.cleanupOldDraftImports(olderThanHours);

            console.log(
                `Cleaned up ${cleanedUpCount} old draft imports (older than ${olderThanHours} hours)`
            );

            return cleanedUpCount;
        } catch (error) {
            console.error('Failed to cleanup old draft imports:', error);
            throw error;
        }
    }

    /**
     * Run cleanup job - can be called by cron job or scheduled task
     */
    static async runCleanupJob(): Promise<void> {
        const CLEANUP_HOURS = parseInt(process.env.DRAFT_IMPORT_CLEANUP_HOURS || '24', 10);

        try {
            await this.cleanupOldDraftImports(CLEANUP_HOURS);
        } catch (error) {
            console.error('Cleanup job failed:', error);
            // Don't throw - let the job runner handle retries
        }
    }
}
