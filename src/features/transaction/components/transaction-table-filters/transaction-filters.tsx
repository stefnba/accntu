'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTransactionEndpoints } from '@/features/transaction/api';
import { useTransactionFilters } from '@/features/transaction/hooks';
import { IconCalendar, IconFilter, IconSearch, IconX } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useState } from 'react';

export const TransactionTableFilters = () => {
    const {
        filters,
        setSearch,
        setDateRange,
        setAccountIds,
        setLabelIds,
        setTagIds,
        setType,
        setCurrencies,
        resetFilters,
    } = useTransactionFilters();

    const [searchValue, setSearchValue] = useState(filters.search || '');

    // Get filter options
    const { data: filterOptions } = useTransactionEndpoints.getFilterOptions({});

    const hasActiveFilters = Object.keys(filters).length > 0;

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchValue);
    };

    const handleDateRangeChange = (startDate?: Date, endDate?: Date) => {
        setDateRange(startDate, endDate);
    };

    const handleMultiSelectChange = (values: string[], setter: (values: string[]) => void) => {
        setter(values);
    };

    return (
        <div className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <IconFilter className="h-4 w-4" />
                    <h3 className="font-medium">Filters</h3>
                </div>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="text-muted-foreground"
                    >
                        <IconX className="h-4 w-4 mr-1" />
                        Clear all
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <form onSubmit={handleSearchSubmit} className="flex gap-2">
                        <Input
                            id="search"
                            placeholder="Search transactions..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit" size="sm" variant="outline">
                            <IconSearch className="h-4 w-4" />
                        </Button>
                    </form>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                    <Label>Date Range</Label>
                    <div className="flex gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="flex-1">
                                    <IconCalendar className="h-4 w-4 mr-2" />
                                    {filters.startDate
                                        ? format(filters.startDate, 'MMM dd')
                                        : 'Start'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={filters.startDate}
                                    onSelect={(date) =>
                                        handleDateRangeChange(date, filters.endDate)
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="flex-1">
                                    <IconCalendar className="h-4 w-4 mr-2" />
                                    {filters.endDate ? format(filters.endDate, 'MMM dd') : 'End'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={filters.endDate}
                                    onSelect={(date) =>
                                        handleDateRangeChange(filters.startDate, date)
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Account Filter */}
                <div className="space-y-2">
                    <Label>Accounts</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                                {filters.accountIds?.length
                                    ? `${filters.accountIds.length} selected`
                                    : 'All accounts'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="start">
                            <div className="space-y-2">
                                {filterOptions?.accounts?.map((account) => (
                                    <div key={account.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`account-${account.id}`}
                                            checked={
                                                filters.accountIds?.includes(account.id) || false
                                            }
                                            onCheckedChange={(checked) => {
                                                const current = filters.accountIds || [];
                                                const updated = checked
                                                    ? [...current, account.id]
                                                    : current.filter((id) => id !== account.id);
                                                setAccountIds(updated);
                                            }}
                                        />
                                        <Label
                                            htmlFor={`account-${account.id}`}
                                            className="text-sm font-normal"
                                        >
                                            {account.name} ({account.type})
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Transaction Type */}
                <div className="space-y-2">
                    <Label>Type</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                                {filters.type?.length
                                    ? `${filters.type.length} selected`
                                    : 'All types'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48" align="start">
                            <div className="space-y-2">
                                {['credit', 'debit', 'transfer'].map((type) => (
                                    <div key={type} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`type-${type}`}
                                            checked={filters.type?.includes(type as any) || false}
                                            onCheckedChange={(checked) => {
                                                const current = filters.type || [];
                                                const updated = checked
                                                    ? [...current, type as any]
                                                    : current.filter((t) => t !== type);
                                                setType(updated);
                                            }}
                                        />
                                        <Label
                                            htmlFor={`type-${type}`}
                                            className="text-sm font-normal capitalize"
                                        >
                                            {type}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
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
                                            filters.accountIds?.filter((id) => id !== accountId) ||
                                            [];
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
            )}
        </div>
    );
};
