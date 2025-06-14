import { type Transaction } from '@/features/transaction/server/db/schema';
import { calculateAutoTagConfidence, shouldAutoTag } from '../utils';
import { addTagToTransaction, getTagsForTransaction, getTagsWithAutoRules } from './db/queries';

export interface AutoTagResult {
    tagId: string;
    tagName: string;
    confidence: 'high' | 'medium' | 'low';
    rules: string[];
}

export const autoTagTransaction = async (
    transaction: Transaction,
    userId: string
): Promise<AutoTagResult[]> => {
    try {
        // Get all tags with auto-tagging rules for this user
        const tagsWithRules = await getTagsWithAutoRules(userId);

        // Get existing tags for this transaction to avoid duplicates
        const existingTags = await getTagsForTransaction(transaction.id);
        const existingTagIds = new Set(existingTags.map((tag) => tag.id));

        const autoTagResults: AutoTagResult[] = [];
        const description = transaction.description || '';

        // Check each tag's auto-rules against the transaction
        for (const tag of tagsWithRules) {
            // Skip if tag is already applied
            if (existingTagIds.has(tag.id)) {
                continue;
            }

            const rules = tag.autoTagRules || [];
            if (shouldAutoTag(description, rules)) {
                const confidence = calculateAutoTagConfidence(description, rules);

                // Add the tag to the transaction
                await addTagToTransaction(transaction.id, tag.id, 'auto', confidence);

                autoTagResults.push({
                    tagId: tag.id,
                    tagName: tag.name,
                    confidence,
                    rules: rules,
                });
            }
        }

        return autoTagResults;
    } catch (error) {
        console.error('Auto-tagging error:', error);
        return [];
    }
};

export const autoTagMultipleTransactions = async (
    transactions: Transaction[],
    userId: string
): Promise<Record<string, AutoTagResult[]>> => {
    const results: Record<string, AutoTagResult[]> = {};

    // Process transactions in parallel for better performance
    const promises = transactions.map(async (transaction) => {
        const autoTagResults = await autoTagTransaction(transaction, userId);
        return { transactionId: transaction.id, results: autoTagResults };
    });

    const processedResults = await Promise.all(promises);

    processedResults.forEach(({ transactionId, results: autoTagResults }) => {
        results[transactionId] = autoTagResults;
    });

    return results;
};

export const previewAutoTags = async (
    transaction: Transaction,
    userId: string
): Promise<AutoTagResult[]> => {
    try {
        // Get all tags with auto-tagging rules for this user
        const tagsWithRules = await getTagsWithAutoRules(userId);

        // Get existing tags for this transaction to mark as duplicates
        const existingTags = await getTagsForTransaction(transaction.id);
        const existingTagIds = new Set(existingTags.map((tag) => tag.id));

        const previewResults: AutoTagResult[] = [];
        const description = transaction.description || '';

        // Check each tag's auto-rules against the transaction
        for (const tag of tagsWithRules) {
            const rules = tag.autoTagRules || [];
            if (shouldAutoTag(description, rules)) {
                const confidence = calculateAutoTagConfidence(description, rules);

                previewResults.push({
                    tagId: tag.id,
                    tagName: tag.name,
                    confidence,
                    rules: rules,
                });
            }
        }

        return previewResults;
    } catch (error) {
        console.error('Auto-tag preview error:', error);
        return [];
    }
};

export const getAutoTagStatistics = async (userId: string) => {
    try {
        const tagsWithRules = await getTagsWithAutoRules(userId);

        const statistics = {
            totalTagsWithRules: tagsWithRules.length,
            totalRules: tagsWithRules.reduce(
                (sum, tag) => sum + (tag.autoTagRules?.length || 0),
                0
            ),
            tagsByType: tagsWithRules.reduce(
                (acc, tag) => {
                    acc[tag.type] = (acc[tag.type] || 0) + 1;
                    return acc;
                },
                {} as Record<string, number>
            ),
            totalAutoTaggedTransactions: tagsWithRules.reduce(
                (sum, tag) => sum + (tag.transactionCount || 0),
                0
            ),
        };

        return statistics;
    } catch (error) {
        console.error('Auto-tag statistics error:', error);
        return {
            totalTagsWithRules: 0,
            totalRules: 0,
            tagsByType: {},
            totalAutoTaggedTransactions: 0,
        };
    }
};

// Utility function to validate auto-tag rules
export const validateAutoTagRules = (rules: string[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    for (const rule of rules) {
        if (!rule.trim()) {
            errors.push('Empty rules are not allowed');
            continue;
        }

        // Check if it's a regex pattern
        if (rule.startsWith('/') && rule.endsWith('/')) {
            try {
                new RegExp(rule.slice(1, -1));
            } catch (error) {
                errors.push(`Invalid regex pattern: ${rule}`);
            }
        }

        // Check rule length
        if (rule.length > 200) {
            errors.push(`Rule too long (max 200 characters): ${rule.substring(0, 50)}...`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
};

// Function to test auto-tag rules against sample text
export const testAutoTagRules = (
    rules: string[],
    testText: string
): {
    matches: boolean;
    confidence: 'high' | 'medium' | 'low';
    matchedRules: string[];
} => {
    const matchedRules: string[] = [];

    for (const rule of rules) {
        if (shouldAutoTag(testText, [rule])) {
            matchedRules.push(rule);
        }
    }

    return {
        matches: matchedRules.length > 0,
        confidence: calculateAutoTagConfidence(testText, rules),
        matchedRules,
    };
};
