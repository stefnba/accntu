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

import type { SelectFilterOption } from './types';

interface Props {
    filteredValues: Set<string | null>;
    options?: SelectFilterOption[];
    filterLabel: string;
    selectFn: (value: Set<string | null>) => void;
    resetFilterKeyFn: (key: string) => void;
}

/**
 *
 */
export const Content: React.FC<Props> = ({
    filteredValues,
    options,
    filterLabel,
    selectFn,
    resetFilterKeyFn
}) => {
    return (
        <>
            <Command>
                <CommandInput placeholder={filterLabel} />
                <CommandList>
                    <CommandEmpty>No results found</CommandEmpty>
                    <CommandGroup>
                        {options?.map((option) => {
                            const isSelected = filteredValues.has(option.value);
                            return (
                                <CommandItem
                                    className="cursor-pointer"
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
                                    {option.count && (
                                        // <span>{option.count}</span>
                                        <span className="ml-auto  text-xs text-muted-foreground">
                                            {/* <span className="ml-auto flex h-4 w-4 text-right items-center justify-center text-xs text-muted-foreground"> */}
                                            {option.count}
                                        </span>
                                    )}
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                    {filteredValues.size > 0 && (
                        <>
                            <CommandSeparator />
                            <CommandGroup>
                                <CommandItem
                                    onSelect={resetFilterKeyFn}
                                    className="justify-center text-center cursor-pointer"
                                >
                                    Clear filter
                                </CommandItem>
                            </CommandGroup>
                        </>
                    )}
                </CommandList>
            </Command>
        </>
    );
};
