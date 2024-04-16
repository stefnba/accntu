'use client';

import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { RxCheck, RxPlusCircled } from 'react-icons/rx';

import { Content } from './content';
import { FilteredLabels } from './filtered-labels';
import type { SelectFilterOption } from './types';

interface Props<T extends string> {
    filterLabel: string;
    filterKey: T;
    filterFn: (key: T, value: string[]) => void;
    options: SelectFilterOption[];
    selectedValues: string[];
}

export function SelectFilter<T extends string>({
    filterKey,
    filterLabel,
    options,
    selectedValues,
    filterFn
}: Props<T>) {
    const filteredValues = new Set(selectedValues);

    const handleSelect = (value: Set<string>) => {
        const values = Array.from(value);
        filterFn(filterKey, values);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-dashed"
                >
                    <RxPlusCircled className="mr-2 h-4 w-4" />
                    {filterLabel}
                    <FilteredLabels
                        filteredValues={filteredValues}
                        options={options}
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Content
                    filterLabel={filterLabel}
                    options={options}
                    filteredValues={filteredValues}
                    selectFn={handleSelect}
                />
            </PopoverContent>
        </Popover>
    );
}
