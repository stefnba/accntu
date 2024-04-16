import { Input } from '@/components/ui/input';

interface Props {
    filterKey: string;
    filterFn: (key: string, value: string) => void;
}

export const SearchFilter: React.FC<Props> = ({ filterKey, filterFn }) => {
    console.log('SearchFilter', filterKey);

    const handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const filterValue = e.target.value;

        if (filterValue.length > 3) {
            filterFn(filterKey, filterValue);
        }
        if (filterValue.length === 0) {
            filterFn(filterKey, '');
        }
    };

    return (
        <Input
            placeholder="Search..."
            // value={
            //     (table.getColumn('title')?.getFilterValue() as string) ?? ''
            // }
            // onChange={(event) =>
            //     table.getColumn('title')?.setFilterValue(event.target.value)
            // }
            // value={filters.title ?? ''}
            onChange={handleFilter}
            className="h-8 w-[150px] lg:w-[250px]"
        />
    );
};
