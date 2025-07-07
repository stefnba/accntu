import { Badge } from '@/components/ui/badge';
import { useTransactionEndpoints } from '@/features/transaction/api';
import { useTransactionFilters } from '@/features/transaction/hooks';

import { IconX } from '@tabler/icons-react';
import { format } from 'date-fns';

export const ActiveFilters = () => {
    const {
        hasActiveFilters,
        filters,
        setSearch,
        setDateRange,
        setAccountIds,

        setType,
    } = useTransactionFilters();
    const { data: filterOptions } = useTransactionEndpoints.getFilterOptions({});

    const handleDateRangeChange = (startDate?: Date, endDate?: Date) => {
        setDateRange(startDate, endDate);
    };

    if (!hasActiveFilters) return null;

    return (
        <div>
            <div className="flex flex-wrap gap-2 pt-2 border-t">
                {filters.search && (
                    <Badge variant="secondary">
                        Search: {filters.search}
                        <button
                            onClick={() => setSearch('')}
                            className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        >
                            <IconX className="h-3 w-3" />
                        </button>
                    </Badge>
                )}
                {filters.startDate && (
                    <Badge variant="secondary">
                        From: {format(filters.startDate, 'MMM dd, yyyy')}
                        <button
                            onClick={() => handleDateRangeChange(undefined, filters.endDate)}
                            className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        >
                            <IconX className="h-3 w-3" />
                        </button>
                    </Badge>
                )}
                {filters.endDate && (
                    <Badge variant="secondary">
                        To: {format(filters.endDate, 'MMM dd, yyyy')}
                        <button
                            onClick={() => handleDateRangeChange(filters.startDate, undefined)}
                            className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        >
                            <IconX className="h-3 w-3" />
                        </button>
                    </Badge>
                )}
                {filters.accountIds?.map((accountId) => {
                    const account = filterOptions?.accounts?.find((a) => a.id === accountId);
                    return account ? (
                        <Badge key={accountId} variant="secondary">
                            {account.name}
                            <button
                                onClick={() => {
                                    const updated =
                                        filters.accountIds?.filter((id) => id !== accountId) || [];
                                    setAccountIds(updated);
                                }}
                                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                            >
                                <IconX className="h-3 w-3" />
                            </button>
                        </Badge>
                    ) : null;
                })}
                {filters.type?.map((type) => (
                    <Badge key={type} variant="secondary">
                        {type}
                        <button
                            onClick={() => {
                                const updated = filters.type?.filter((t) => t !== type) || [];
                                setType(updated);
                            }}
                            className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        >
                            <IconX className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>
        </div>
    );
};
