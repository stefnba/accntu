'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export const TransactionTableSkeleton = () => {
    return (
        <div className="space-y-4">
            {/* Table Skeleton */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <TableHead key={i}>
                                    <Skeleton className="h-6 w-full" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 10 }).map((_, i) => (
                            <TableRow key={i}>
                                {Array.from({ length: 5 }).map((_, j) => (
                                    <TableCell key={j}>
                                        <Skeleton className="h-6 w-full" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {/* Pagination Skeleton */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-1/4" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-8 w-12" />
                    <Skeleton className="h-8 w-12" />
                </div>
            </div>
        </div>
    );
};
