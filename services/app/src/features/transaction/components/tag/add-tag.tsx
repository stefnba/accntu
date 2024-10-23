import { Tag } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { useGetTags } from '@/features/tag/api/get-tags';
import { useAddTagToTransaction } from '@/features/transaction/api/add-tag';
import { useState } from 'react';
import { LuPlus } from 'react-icons/lu';

interface Props {
    transactionId: string;
    appliedTagIds?: string[];
}

export const AddTransactionTag: React.FC<Props> = ({
    transactionId,
    appliedTagIds
}) => {
    const [isOpen, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const { mutate } = useAddTagToTransaction({ transactionId });
    const { data: tags = [] } = useGetTags({
        search: searchValue,
        exclude: appliedTagIds
    });

    return (
        <Popover open={isOpen} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    onClick={() => setOpen(!isOpen)}
                    variant="ghost"
                    size="sm"
                    className="m-0 p-0 h-3"
                >
                    <Badge className="rounded-md flex items-center cursor-pointer px-2">
                        <LuPlus className="mr-1 ml-0 size-3" />
                        Add Tag
                    </Badge>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-0 group mt-1" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search or start typing..."
                        onValueChange={setSearchValue}
                    />
                    <CommandList>
                        {!searchValue && tags.length === 0 && (
                            <CommandEmpty>No tags found</CommandEmpty>
                        )}

                        {searchValue && tags.length === 0 && (
                            <CommandEmpty>
                                <div
                                    onClick={() => {
                                        mutate({
                                            transactionId,
                                            name: searchValue
                                        });
                                        setOpen(false);
                                        setSearchValue('');
                                    }}
                                >
                                    Add {searchValue}
                                </div>
                            </CommandEmpty>
                        )}
                        <CommandGroup>
                            {searchValue && (
                                <>
                                    <CommandItem
                                        className="cursor-pointer"
                                        onSelect={() => {
                                            mutate({
                                                transactionId,
                                                name: searchValue
                                            });
                                            setOpen(false);
                                            setSearchValue('');
                                        }}
                                    >
                                        Create &apos;{searchValue}&apos;
                                    </CommandItem>
                                    <CommandSeparator className="my-2" />
                                </>
                            )}
                            {tags.map((tag) => (
                                <CommandItem
                                    className="flex items-center cursor-pointer"
                                    key={tag.id}
                                    value={tag.id}
                                    onSelect={() => {
                                        mutate({
                                            transactionId,
                                            tagId: tag.id
                                        });
                                        setOpen(false);
                                    }}
                                >
                                    <Tag
                                        style={{
                                            color: tag.color || 'black'
                                        }}
                                        className="mr-2 text-white font-bold size-4 p-0 m-0"
                                    />
                                    {tag.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
