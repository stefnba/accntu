import { Button } from '@/components/ui/button';

interface Props {
    children: React.ReactNode;
}

export const FilterButton: React.FC<Props> = ({ children }) => {
    return (
        <Button variant="outline" size="sm" className="h-8 border-dashed">
            {children}
        </Button>
    );
};
