import { PaginationState, SortingState } from '@tanstack/react-table';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// ===================
// Types
// ===================

type TransactionFilters = {
    search?: string;
    startDate?: Date;
    endDate?: Date;
    accountIds?: string[];
    labelIds?: string[];
    tagIds?: string[];
    type?: ('transfer' | 'credit' | 'debit')[];
    currencies?: string[];
};

type TransactionTableState = {
    // Pagination
    pagination: PaginationState;
    setPagination: (pagination: PaginationState | ((prev: PaginationState) => PaginationState)) => void;
    
    // Sorting
    sorting: SortingState;
    setSorting: (sorting: SortingState | ((prev: SortingState) => SortingState)) => void;
    
    // Filters
    filters: TransactionFilters;
    setFilters: (filters: TransactionFilters | ((prev: TransactionFilters) => TransactionFilters)) => void;
    resetFilters: () => void;
    
    // Individual filter setters for easier use
    setSearch: (search: string) => void;
    setDateRange: (startDate?: Date, endDate?: Date) => void;
    setAccountIds: (accountIds: string[]) => void;
    setLabelIds: (labelIds: string[]) => void;
    setTagIds: (tagIds: string[]) => void;
    setType: (type: ('transfer' | 'credit' | 'debit')[]) => void;
    setCurrencies: (currencies: string[]) => void;
};

// ===================
// Store
// ===================

export const useTransactionTableStore = create<TransactionTableState>()(
    subscribeWithSelector((set, get) => ({
        // Initial pagination state
        pagination: {
            pageIndex: 0,
            pageSize: 50,
        },
        
        setPagination: (pagination) => {
            set((state) => ({
                pagination: typeof pagination === 'function' ? pagination(state.pagination) : pagination,
            }));
        },
        
        // Initial sorting state - default by date desc
        sorting: [
            {
                id: 'date',
                desc: true,
            },
        ],
        
        setSorting: (sorting) => {
            set((state) => ({
                sorting: typeof sorting === 'function' ? sorting(state.sorting) : sorting,
            }));
        },
        
        // Initial filter state
        filters: {},
        
        setFilters: (filters) => {
            set((state) => ({
                filters: typeof filters === 'function' ? filters(state.filters) : filters,
                // Reset to first page when filters change
                pagination: { ...state.pagination, pageIndex: 0 },
            }));
        },
        
        resetFilters: () => {
            set((state) => ({
                filters: {},
                pagination: { ...state.pagination, pageIndex: 0 },
            }));
        },
        
        // Individual filter setters
        setSearch: (search) => {
            set((state) => ({
                filters: { ...state.filters, search: search || undefined },
                pagination: { ...state.pagination, pageIndex: 0 },
            }));
        },
        
        setDateRange: (startDate, endDate) => {
            set((state) => ({
                filters: { 
                    ...state.filters, 
                    startDate: startDate || undefined,
                    endDate: endDate || undefined 
                },
                pagination: { ...state.pagination, pageIndex: 0 },
            }));
        },
        
        setAccountIds: (accountIds) => {
            set((state) => ({
                filters: { 
                    ...state.filters, 
                    accountIds: accountIds.length ? accountIds : undefined 
                },
                pagination: { ...state.pagination, pageIndex: 0 },
            }));
        },
        
        setLabelIds: (labelIds) => {
            set((state) => ({
                filters: { 
                    ...state.filters, 
                    labelIds: labelIds.length ? labelIds : undefined 
                },
                pagination: { ...state.pagination, pageIndex: 0 },
            }));
        },
        
        setTagIds: (tagIds) => {
            set((state) => ({
                filters: { 
                    ...state.filters, 
                    tagIds: tagIds.length ? tagIds : undefined 
                },
                pagination: { ...state.pagination, pageIndex: 0 },
            }));
        },
        
        setType: (type) => {
            set((state) => ({
                filters: { 
                    ...state.filters, 
                    type: type.length ? type : undefined 
                },
                pagination: { ...state.pagination, pageIndex: 0 },
            }));
        },
        
        setCurrencies: (currencies) => {
            set((state) => ({
                filters: { 
                    ...state.filters, 
                    currencies: currencies.length ? currencies : undefined 
                },
                pagination: { ...state.pagination, pageIndex: 0 },
            }));
        },
    }))
);