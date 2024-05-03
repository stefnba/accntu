import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Table as ReactTable, flexRender } from '@tanstack/react-table';
import { Column } from '@tanstack/react-table';
import React from 'react';
import {
    RxArrowDown as ArrowDownIcon,
    RxArrowUp as ArrowUpIcon,
    RxCaretSort as CaretSortIcon,
    RxEyeNone as EyeNoneIcon
} from 'react-icons/rx';
import {
    RxChevronLeft,
    RxChevronRight,
    RxDoubleArrowLeft,
    RxDoubleArrowRight
} from 'react-icons/rx';

import { Skeleton } from './skeleton';

interface DataTableColumnHeaderProps<TColKey extends string>
    extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    columnKey: TColKey;
    showVisibility?: boolean;
    enableSorting?: boolean;
    sorting?: {
        sortingFn: (
            column: TColKey,
            direction?: 'asc' | 'desc',
            appendFilter?: boolean
        ) => void;
        currentSorting: { column: string; direction?: 'asc' | 'desc' }[];
    };
}

export function DataTableColumnHeader<TColKey extends string>({
    columnKey,
    title,
    className,
    showVisibility = false,
    sorting
}: DataTableColumnHeaderProps<TColKey>) {
    if (!sorting) {
        return <div className={cn(className)}>{title}</div>;
    }

    const { currentSorting, sortingFn } = sorting;
    const isSortedCol = currentSorting.find((s) => s.column === columnKey);

    return (
        <div className={cn('flex items-center space-x-2', className)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-3 h-8 data-[state=open]:bg-accent focus-visible:ring-0 focus-visible:ring-offset-0"
                    >
                        <span>{title}</span>
                        {!isSortedCol && (
                            <CaretSortIcon className="ml-2 h-4 w-4" />
                        )}
                        {isSortedCol?.direction === 'asc' && (
                            <ArrowUpIcon className="ml-2 h-4 w-4" />
                        )}
                        {isSortedCol?.direction === 'desc' && (
                            <ArrowDownIcon className="ml-2 h-4 w-4" />
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem
                        onClick={(e) => sortingFn(columnKey, 'asc', e.shiftKey)}
                    >
                        <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Asc
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={(e) =>
                            sortingFn(columnKey, 'desc', e.shiftKey)
                        }
                    >
                        <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Desc
                    </DropdownMenuItem>
                    {showVisibility && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                            // onClick={() => column.toggleVisibility(false)}
                            >
                                <EyeNoneIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Hide
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

interface DataTableLoadingSkeletonProps<TData> {
    table: ReactTable<TData>;
}

function DataTableLoadingSkeleton<TData>({
    table
}: DataTableLoadingSkeletonProps<TData>) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <TableRow key={i}>
            {table.getAllColumns().map((col) => (
                // <div key={col.id}>d</div>
                <TableCell key={col.id}>
                    <Skeleton className="h-4 w-full" />
                </TableCell>
            ))}
        </TableRow>
    ));
}

interface DataTableProps<TData> {
    table: ReactTable<TData>;
    className?: string;
    isLoading?: boolean;
}

export function DataTable<TData>({
    table,
    className,
    isLoading
}: DataTableProps<TData>) {
    return (
        <Table className={className}>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                            return (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                          )}
                                </TableHead>
                            );
                        })}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    <DataTableLoadingSkeleton table={table} />
                ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && 'selected'}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="py-2">
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell
                            colSpan={table.getAllColumns().length}
                            className="h-24 text-center"
                        >
                            No results.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}

interface DataTablePaginationProps<TData> {
    table: ReactTable<TData>;
}

export function DataTablePagination<TData>({
    table
}: DataTablePaginationProps<TData>) {
    return (
        <div className="flex items-center justify-between px-2 mb-8">
            <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{' '}
                {table.getFilteredRowModel().rows.length} row(s) selected
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value));
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue
                                placeholder={
                                    table.getState().pagination.pageSize
                                }
                            />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((pageSize) => (
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
                    Page {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount()}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to first page</span>
                        <RxDoubleArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <RxChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to next page</span>
                        <RxChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() =>
                            table.setPageIndex(table.getPageCount() - 1)
                        }
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to last page</span>
                        <RxDoubleArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
