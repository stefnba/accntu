import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { storeTransactionTableRowSelection } from '@/features/transaction/store';
import { storeBulkUpdateTransactionSheet } from '@/features/transaction/store/bulk-update-transaction-sheet';
import { RxDotsHorizontal, RxDownload, RxPencil2 } from 'react-icons/rx';

interface Props {}

export const TransactionTableActionBar: React.FC<Props> = () => {
    const rowSelection = storeTransactionTableRowSelection(
        (state) => state.rowSelection
    );

    const { handleOpen } = storeBulkUpdateTransactionSheet();

    const selectedRowCount = Object.keys(rowSelection).length;

    return (
        <div className="flex items-center justify-between space-x-2">
            {/* Update Button */}
            {selectedRowCount > 0 && (
                <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto hidden h-8 lg:flex"
                    onClick={handleOpen}
                >
                    <RxPencil2 className="mr-2 h-4 w-4" />
                    Update
                </Button>
            )}
            {/* Export Button */}
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
