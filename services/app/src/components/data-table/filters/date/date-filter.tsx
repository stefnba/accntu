'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/data-picker';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { RxPlusCircled } from 'react-icons/rx';

import { FilteredLabels } from './filtered-labels';
import type { TDateFilterFilteredValue } from './types';

interface Props<T extends string> {
    filterLabel: string;
    filterKey: T;
    filterFn: (key: T, value: TDateFilterFilteredValue) => void;
    filteredValue?: TDateFilterFilteredValue;
    resetFilterKeyFn: (key: T) => void;
    periodOptions: Array<{ value: string; label: string }>;
}

export function DateFilter<T extends string>({
    filterKey,
    filterLabel,
    filteredValue,
    periodOptions,
    filterFn,
    resetFilterKeyFn
}: Props<T>) {
    const onOpen = (open: boolean) => {
        if (open) {
            // handleFilterOptionsFetch();
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-dashed"
                >
                    <RxPlusCircled className="mr-2 h-4 w-4" />
                    {filterLabel}
                    <FilteredLabels
                        filteredPeriod={filteredValue?.period}
                        periodOptions={periodOptions}
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px] p-1" align="start">
                {periodOptions.map((option) => {
                    const isSelected = filteredValue?.period === option.value;
                    return (
                        <DropdownMenuItem
                            key={option.value}
                            onSelect={() => {
                                if (isSelected) {
                                    resetFilterKeyFn(filterKey);
                                    return;
                                }

                                filterFn(filterKey, {
                                    period: option.value
                                });
                            }}
                        >
                            <Checkbox checked={isSelected} className="mr-2" />
                            {option.label}
                        </DropdownMenuItem>
                    );
                })}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Checkbox
                            checked={filteredValue?.period === 'CUSTOM'}
                            className="mr-2"
                        />
                        Custom
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-72 p-4 flex-1 space-y-2">
                        <DatePicker />
                        <DatePicker />
                        <Button size="sm" className="ml-auto">
                            Apply
                        </Button>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                {filteredValue && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onClick={() => resetFilterKeyFn(filterKey)}
                                className="justify-center text-center cursor-pointer"
                            >
                                Clear filter
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
