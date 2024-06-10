import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useGetTransactions } from '@/features/transaction/api/get-transactions';
import {
    storeTransactionTablePagination,
    storeTransactionTableRowSelection
} from '@/features/transaction/store';
import {
    RxChevronLeft,
    RxChevronRight,
    RxDoubleArrowLeft,
    RxDoubleArrowRight
} from 'react-icons/rx';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50];

export function TransactionTablePagination() {
    const { rowSelection } = storeTransactionTableRowSelection();
    const { count } = useGetTransactions();

    const { page, setPageSize, setPage, pageSize } =
        storeTransactionTablePagination();

    const totalPages = Math.ceil(count / pageSize);

    const getCanPreviousPage = () => {
        return page > 1;
    };
    const getCanNextPage = () => {
        return page < totalPages;
    };

    return (
        <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <Select
                    value={`${pageSize}`}
                    onValueChange={(value) => {
                        setPageSize(Number(value));
                    }}
                >
                    <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={`${pageSize}`} />
                    </SelectTrigger>
                    <SelectContent side="top">
                        {DEFAULT_PAGE_SIZE_OPTIONS.map((pageSize) => (
                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                {pageSize}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {page} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                >
                    <span className="sr-only">Go to first page</span>
                    <RxDoubleArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setPage(page - 1)}
                    disabled={!getCanPreviousPage()}
                >
                    <span className="sr-only">Go to previous page</span>
                    <RxChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => setPage(page + 1)}
                    disabled={!getCanNextPage()}
                >
                    <span className="sr-only">Go to next page</span>
                    <RxChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                >
                    <span className="sr-only">Go to last page</span>
                    <RxDoubleArrowRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
