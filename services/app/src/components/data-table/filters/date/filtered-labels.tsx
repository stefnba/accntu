import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import type { TDateFilterFilteredValue } from './types';

interface Props {
    filteredPeriod: string | undefined;
    periodOptions: Array<{ value: string; label: string }>;
}

/**
 *
 */
export const FilteredLabels: React.FC<Props> = ({
    filteredPeriod,
    periodOptions
}) => {
    if (!filteredPeriod) return null;

    const periodLabel = periodOptions.find(
        (option) => option.value === filteredPeriod
    );

    return (
        <>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
            >
                {8}
            </Badge>
            <div className="hidden space-x-1 lg:flex">
                <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                >
                    {periodLabel?.label}
                </Badge>
            </div>
        </>
    );
};
