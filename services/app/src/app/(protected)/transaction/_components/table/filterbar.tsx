import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table } from '@tanstack/react-table';
import { RxCross2, RxQuestionMarkCircled } from 'react-icons/rx';

import { DataTableFacetedFilter } from './filters/filter';

interface Props<TData> {
    table: Table<TData>;
}

export const statuses = [
    {
        value: 'backlog',
        label: 'Backlog',
        icon: RxQuestionMarkCircled
    },
    {
        value: 'todo',
        label: 'Todo',
        icon: RxQuestionMarkCircled
    },
    {
        value: 'in progress',
        label: 'In Progress',
        icon: RxQuestionMarkCircled
    },
    {
        value: 'done',
        label: 'Done',
        icon: RxQuestionMarkCircled
    },
    {
        value: 'canceled',
        label: 'Canceled',
        icon: RxQuestionMarkCircled
    }
];

export function TransactionTableFilterBar<TData>({ table }: Props<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;
    return (
        <div className="flex flex-1 items-center space-x-2">
            <Input
                placeholder="Search..."
                value={
                    (table.getColumn('title')?.getFilterValue() as string) ?? ''
                }
                onChange={(event) =>
                    table.getColumn('title')?.setFilterValue(event.target.value)
                }
                className="h-8 w-[150px] lg:w-[250px]"
            />

            <DataTableFacetedFilter
                column={table.getColumn('accountId')}
                title="Account"
                options={statuses}
            />
            <DataTableFacetedFilter
                column={table.getColumn('type')}
                title="type"
                options={statuses}
            />
            {isFiltered && (
                <Button
                    variant="ghost"
                    onClick={() => table.resetColumnFilters()}
                    className="h-8 px-2 lg:px-3"
                >
                    Reset
                    <RxCross2 className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
