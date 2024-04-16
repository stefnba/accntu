import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import type { SelectFilterOption } from './types';

interface Props {
    filteredValues: Set<string>;
    options: SelectFilterOption[];
}

/**
 *
 */
export const FilteredLabels: React.FC<Props> = ({
    filteredValues,
    options
}) => {
    if (filteredValues.size > 0) {
        return (
            <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal lg:hidden"
                >
                    {filteredValues.size}
                </Badge>
                <div className="hidden space-x-1 lg:flex">
                    {filteredValues.size > 2 ? (
                        <Badge
                            variant="secondary"
                            className="rounded-sm px-1 font-normal"
                        >
                            {filteredValues.size} selected
                        </Badge>
                    ) : (
                        options
                            .filter((option) =>
                                filteredValues.has(option.value)
                            )
                            .map((option) => (
                                <Badge
                                    variant="secondary"
                                    key={option.value}
                                    className="rounded-sm px-1 font-normal"
                                >
                                    {option.label}
                                </Badge>
                            ))
                    )}
                </div>
            </>
        );
    }
};
