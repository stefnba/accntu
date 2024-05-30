import { create } from 'zustand';

interface IStoreTransactionTablePagination {
    page: number;
    pageSize: number;
    setPageSize: (pageSize: number) => void;
    setPage: (page: number) => void;
}

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

export const storeTransactionTablePagination =
    create<IStoreTransactionTablePagination>((set) => ({
        page: DEFAULT_PAGE,
        pageSize: DEFAULT_PAGE_SIZE,
        setPageSize: (pageSize) => set({ pageSize, page: 1 }),
        setPage: (page) => set({ page })
    }));
