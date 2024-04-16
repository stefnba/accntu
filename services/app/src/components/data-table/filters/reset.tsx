import { Button } from '@/components/ui/button';
import { RxCross2 } from 'react-icons/rx';

interface Props {
    isFiltered: boolean;
    resetFiltersFn: () => void;
}

export const FilterResetButton: React.FC<Props> = ({
    isFiltered,
    resetFiltersFn
}) => {
    if (!isFiltered) {
        return null;
    }

    return (
        <Button
            variant="ghost"
            onClick={() => resetFiltersFn()}
            className="h-8 px-2 lg:px-3"
        >
            Reset
            <RxCross2 className="ml-2 h-4 w-4" />
        </Button>
    );
};
