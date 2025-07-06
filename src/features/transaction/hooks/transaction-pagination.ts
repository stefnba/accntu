import { parseAsInteger, useQueryState } from 'nuqs';

const DEFAULT_PAGE_SIZE = 25;

/**
 * Hook to manage transaction table pagination.
 */
export const useTransactionTablePagination = () => {
    const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(0));
    const [pageSize, setPageSize] = useQueryState(
        'pageSize',
        parseAsInteger.withDefault(DEFAULT_PAGE_SIZE)
    );

    const setPagination = ({ page, pageSize }: { page?: number; pageSize?: number }) => {
        if (page) {
            setPage(page);
        }
        if (pageSize) {
            setPageSize(pageSize);
        }
    };

    return {
        pagination: {
            pageIndex: page,
            pageSize: pageSize,
        },
        setPagination: setPagination,
    };
};
