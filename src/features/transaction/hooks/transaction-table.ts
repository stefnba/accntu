import { useQueryStates, parseAsInteger, parseAsString } from 'nuqs';
import { useMemo } from 'react';
import { PaginationState, SortingState } from '@tanstack/react-table';

// ===================
// Types
// ===================

export type TransactionTableConfig = {
    // Pagination
    pagination: PaginationState;
    setPagination: (pagination: PaginationState | ((prev: PaginationState) => PaginationState)) => void;
    
    // Sorting
    sorting: SortingState;
    setSorting: (sorting: SortingState | ((prev: SortingState) => SortingState)) => void;
    
    // Reset pagination when filters change
    resetPagination: () => void;
};

// ===================
// Parsers
// ===================

const parseAsSort = parseAsString.withDefault('date:desc');

// ===================
// Hook
// ===================

export const useTransactionTable = (): TransactionTableConfig => {
    const [tableState, setTableState] = useQueryStates({
        page: parseAsInteger.withDefault(0),
        pageSize: parseAsInteger.withDefault(50),
        sort: parseAsSort,
    });

    // Convert URL state to TanStack Table format
    const pagination = useMemo((): PaginationState => ({
        pageIndex: tableState.page,
        pageSize: tableState.pageSize,
    }), [tableState.page, tableState.pageSize]);

    const sorting = useMemo((): SortingState => {
        const [id, desc] = tableState.sort.split(':');
        return [{
            id: id || 'date',
            desc: desc === 'desc',
        }];
    }, [tableState.sort]);

    // Table state setters
    const setPagination = (newPagination: PaginationState | ((prev: PaginationState) => PaginationState)) => {
        const paginationToApply = typeof newPagination === 'function' ? newPagination(pagination) : newPagination;
        
        setTableState({
            page: paginationToApply.pageIndex,
            pageSize: paginationToApply.pageSize,
        });
    };

    const setSorting = (newSorting: SortingState | ((prev: SortingState) => SortingState)) => {
        const sortingToApply = typeof newSorting === 'function' ? newSorting(sorting) : newSorting;
        
        if (sortingToApply.length > 0) {
            const { id, desc } = sortingToApply[0];
            setTableState({
                sort: `${id}:${desc ? 'desc' : 'asc'}`,
            });
        } else {
            setTableState({
                sort: 'date:desc',
            });
        }
    };

    const resetPagination = () => {
        setTableState({ page: 0 });
    };

    return {
        pagination,
        setPagination,
        sorting,
        setSorting,
        resetPagination,
    };
};