import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { useGetImport } from '@/features/import/api/get-import';
import { storeCreateImportData } from '@/features/import/store/create-import-data';
import { storePreviewImportFiles } from '@/features/import/store/preview-import-files';
import { ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {}

/**
 * Drop
 */
export const CreateImportPreviewFiles: React.FC<Props> = ({}) => {
    const { importId } = storeCreateImportData();

    const { data, isLoading } = useGetImport({
        id: importId
    });

    const [open, setOpen] = useState(false);
    const { fileId, setFileId } = storePreviewImportFiles();

    useEffect(() => {
        if (data) {
            setFileId(data?.files[0]?.id);
        }
    }, [data, setFileId]);

    if (isLoading) return <div>Loading files...</div>;
    if (!data) return null;
    const { files = [] } = data;

    console.log(data);

    const newFiles = files.filter((f) => !f.importedAt);
    const importedFiles = files.filter((f) => f.importedAt);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[400px] justify-between overflow-hidden truncate"
                >
                    {fileId
                        ? files.find((f) => f.id === fileId)?.filename
                        : 'Select Files...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-[400px] p-0 overflow-ellipsis"
            >
                <Command>
                    <CommandEmpty>No files found.</CommandEmpty>
                    <CommandList>
                        <CommandGroup heading="New">
                            {newFiles.map((f) => (
                                <CommandItem
                                    // className="h-8"
                                    key={f.id}
                                    value={f.id}
                                    onSelect={(currentValue) => {
                                        setFileId(
                                            currentValue === fileId
                                                ? ''
                                                : currentValue
                                        );
                                        setOpen(false);
                                    }}
                                >
                                    <Checkbox
                                        checked={fileId === f.id}
                                        className="mr-2"
                                    />
                                    {f.filename}
                                    {f.updatedAt && <div>upload</div>}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandGroup heading="Already imported">
                            {importedFiles.map((f) => (
                                <CommandItem key={f.id}>
                                    {f.filename}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
