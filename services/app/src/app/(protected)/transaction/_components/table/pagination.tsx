import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Table } from '@tanstack/react-table';
import {
    RxChevronLeft,
    RxChevronRight,
    RxDoubleArrowLeft,
    RxDoubleArrowRight
} from 'react-icons/rx';

interface Props<TData> {
    table: Table<TData>;
    pagination?: {
        page?: number;
        pageSize?: number;
        pageSizeOptions?: number[];
        handlePageSizeChange?: (value: number) => void;
        handlePageChange?: (value: number) => void;
    };
    selection?: {
        count?: number;
    };
    records?: {
        total?: number;
    };
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50];
const DEFAULT_PAGE_SIZE = 25;

export function TransactionTablePagination<TData>({
    table,
    pagination,
    selection,
    records
}: Props<TData>) {
    const count = {
        total: records?.total ?? table.getRowCount(),
        selected:
            selection?.count ?? table.getFilteredSelectedRowModel().rows.length
    };
    const { page, pageSize, pageSizeOptions, totalPages } = {
        page: pagination?.page ?? table.getState().pagination.pageIndex + 1,
        pageSize: pagination?.pageSize ?? table.getState().pagination.pageSize,
        totalPages: Math.ceil(
            count.total /
                (pagination?.pageSize ?? table.getState().pagination.pageSize)
        ),
        pageSizeOptions:
            pagination?.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS
    };

    const handlePageSizeChange = (value: number) => {
        if (pagination?.handlePageSizeChange) {
            pagination.handlePageSizeChange(value);
        } else {
            table.setPageSize(value);
        }
    };
    const handlePageChange = (value: number) => {
        if (pagination?.handlePageChange) {
            pagination.handlePageChange(value);
        } else {
            table.setPageIndex(value - 1);
        }
    };
    const getCanPreviousPage = () => {
        return page > 1;
    };
    const getCanNextPage = () => {
        return page < totalPages;
    };

    return (
        <div className="flex items-center justify-between px-2 mb-8">
            <div className="flex-1 text-sm text-muted-foreground">
                {count.selected} of {count.total} row(s) selected
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => {
                            handlePageSizeChange(Number(value));
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={`${pageSize}`} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {pageSizeOptions.map((pageSize) => (
                                <SelectItem
                                    key={pageSize}
                                    value={`${pageSize}`}
                                >
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
                        onClick={() => handlePageChange(0)}
                        disabled={page === 1}
                    >
                        <span className="sr-only">Go to first page</span>
                        <RxDoubleArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={!getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <RxChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={!getCanNextPage()}
                    >
                        <span className="sr-only">Go to next page</span>
                        <RxChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={page === totalPages}
                    >
                        <span className="sr-only">Go to last page</span>
                        <RxDoubleArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
