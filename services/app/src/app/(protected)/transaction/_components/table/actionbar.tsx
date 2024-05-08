import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { RxDotsHorizontal, RxDownload, RxPencil2 } from 'react-icons/rx';

import { TransactionUpdateSheet } from '../update/update-sheet';
import { useTransactionTableRowSelectionStore } from './store';

interface Props {}

export const TransactionTableActionBar: React.FC<Props> = () => {
    const rowSelection = useTransactionTableRowSelectionStore(
        (state) => state.rowSelection
    );

    const selectedRowCount = Object.keys(rowSelection).length;

    return (
        <div className="flex items-center justify-between space-x-2">
            {selectedRowCount > 0 && <TransactionUpdateSheet />}
            {selectedRowCount > 0 && (
                <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto hidden h-8 lg:flex"
                >
                    <RxDownload className="mr-2 h-4 w-4" />
                    Export
                </Button>
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                    >
                        <RxDotsHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[150px]">
                    <DropdownMenuLabel>More actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Select Columns</DropdownMenuItem>
                    <DropdownMenuItem>Export</DropdownMenuItem>
                    <DropdownMenuItem>Copy Filters</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
