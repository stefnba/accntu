import { Checkbox } from '@/components/ui/checkbox';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { RxCheck, RxPlusCircled } from 'react-icons/rx';

import type { SelectFilterOption } from './types';

interface Props {
    filteredValues: Set<string | null>;
    options: SelectFilterOption[];
    filterLabel: string;
    selectFn: (value: Set<string | null>) => void;
}

/**
 *
 */
export const Content: React.FC<Props> = ({
    filteredValues,
    options,
    filterLabel,
    selectFn
}) => {
    return (
        <>
            <Command>
                <CommandInput placeholder={filterLabel} />
                <CommandList>
                    <CommandEmpty>No results found</CommandEmpty>
                    <CommandGroup>
                        {options.map((option) => {
                            const isSelected = filteredValues.has(option.value);
                            return (
                                <CommandItem
                                    onSelect={() => {
                                        if (isSelected) {
                                            filteredValues.delete(option.value);
                                        } else {
                                            filteredValues.add(option.value);
                                        }

                                        selectFn(filteredValues);
                                    }}
                                    key={option.value}
                                >
                                    <Checkbox
                                        checked={isSelected}
                                        className="mr-2"
                                    />
                                    <span>{option.label}</span>
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                    {filteredValues.size > 0 && (
                        <>
                            <CommandSeparator />
                            <CommandGroup>
                                <CommandItem
                                    onSelect={
                                        () => ({})
                                        // column?.setFilterValue(undefined)
                                    }
                                    className="justify-center text-center"
                                >
                                    Clear filters
                                </CommandItem>
                            </CommandGroup>
                        </>
                    )}
                </CommandList>
            </Command>
        </>
    );
};
