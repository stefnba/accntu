import { apiClient, createMutation, createQuery } from '@/lib/api';

const BUDGET_QUERY_KEYS = {
    ALL: 'budgets',
    ONE: 'budget',
} as const;

export const useBudgetEndpoints = {
    /**
     * Get all transaction budgets
     */
    getAll: createQuery(apiClient.budgets.$get, BUDGET_QUERY_KEYS.ALL),

    /**
     * Get a transaction budget by id
     */
    getById: createQuery(apiClient.budgets[':id'].$get, BUDGET_QUERY_KEYS.ONE),

    /**
     * Calculate budget for a transaction
     */
    calculate: createMutation(apiClient.budgets.calculate.$post, BUDGET_QUERY_KEYS.ALL),

    /**
     * Recalculate budget for a transaction
     */
    recalculate: createMutation(apiClient.budgets.recalculate.$post, BUDGET_QUERY_KEYS.ALL),

    /**
     * Process all pending recalculations
     */
    processPending: createMutation(apiClient.budgets['process-pending'].$post, BUDGET_QUERY_KEYS.ALL),

    /**
     * Create a new transaction budget
     */
    create: createMutation(apiClient.budgets.$post, BUDGET_QUERY_KEYS.ALL),

    /**
     * Update a transaction budget
     */
    update: createMutation(apiClient.budgets[':id'].$patch, BUDGET_QUERY_KEYS.ONE),

    /**
     * Delete a transaction budget
     */
    delete: createMutation(apiClient.budgets[':id'].$delete, BUDGET_QUERY_KEYS.ALL),
};