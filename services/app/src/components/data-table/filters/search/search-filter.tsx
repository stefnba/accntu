import { Input } from '@/components/ui/input';

interface Props<T extends string> {
    value?: string;
    filterKey: T;
    filterFn: (key: T, value: string) => void;
    resetFilterKeyFn: (key: T) => void;
}

export function SearchFilter<T extends string>({
    filterKey,
    filterFn,
    value,
    resetFilterKeyFn
}: Props<T>) {
    const handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const filterValue = e.target.value;

        if (filterValue.length === 0 || filterValue === undefined) {
            resetFilterKeyFn(filterKey);
        } else {
            filterFn(filterKey, filterValue);
        }
    };

    return (
        <Input
            placeholder="Search..."
            onChange={handleFilter}
            // onChange={(event) => filterFn(filterKey, event.target.value)}
            value={value || ''}
            className="h-8 w-[150px] lg:w-[250px]"
        />
    );
}
