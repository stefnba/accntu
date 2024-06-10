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
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import dayjs from 'dayjs';
import { filter } from 'minimatch';
import { RxPlusCircled } from 'react-icons/rx';
import { start } from 'repl';

import { FilteredLabels } from './filtered-labels';
import type { TDateFilterFilteredValue } from './types';

export type TDateFilterPeriodOptions = Array<{
    value: string;
    label: string;
    startDate: Date;
    endDate: Date;
}>;

interface Props<T extends string> {
    filterLabel: string;
    filterKey: T;
    periodEndfilterKey: T;
    periodStartfilterKey: T;

    filterFn: (key: T, value: Date) => void;
    filteredValue?: [Date | undefined, Date | undefined];
    resetFilterKeyFn: (key: T) => void;
    /** Pre-selected period ranges, e.g. current year. */
    periodOptions: TDateFilterPeriodOptions;
}

export function DateFilter<T extends string>({
    filterKey,
    filterLabel,
    filteredValue,
    periodOptions,
    periodEndfilterKey,
    periodStartfilterKey,
    filterFn,
    resetFilterKeyFn
}: Props<T>) {
    const startDate = filteredValue?.[0]
        ? dayjs(filteredValue?.[0]).format('YYYY-MM-DD')
        : undefined;
    const endDate = filteredValue?.[1]
        ? dayjs(filteredValue?.[1]).format('YYYY-MM-DD')
        : undefined;

    const filteredPeriod = periodOptions.find(
        (o) =>
            dayjs(o.startDate).format('YYYY-MM-DD') === startDate &&
            dayjs(o.endDate).format('YYYY-MM-DD') === endDate
    );

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
                        filteredPeriod={filteredPeriod?.value}
                        periodOptions={periodOptions}
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px] p-1" align="start">
                {periodOptions.map((option) => {
                    const isSelected = filteredPeriod?.value === option.value;
                    return (
                        <DropdownMenuItem
                            key={option.value}
                            onSelect={() => {
                                if (isSelected) {
                                    resetFilterKeyFn(periodEndfilterKey);
                                    resetFilterKeyFn(periodStartfilterKey);
                                    return;
                                }

                                filterFn(
                                    periodStartfilterKey,
                                    option.startDate
                                );

                                filterFn(periodEndfilterKey, option.endDate);
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
                            checked={
                                filteredPeriod === undefined &&
                                startDate !== undefined &&
                                endDate !== undefined
                            }
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
