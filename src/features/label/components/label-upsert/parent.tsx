import { Button } from '@/components/ui/button';
import { useLabelEndpoints } from '@/features/label/api';
import { LabelBadge } from '@/features/label/components/label-badge';
import { LabelSelectorContent } from '@/features/label/components/label-selector';
import { useLabelUpsertModal } from '@/features/label/hooks';
import { cn } from '@/lib/utils';
import { Edit, X } from 'lucide-react';

export const LabelUpsertParent = () => {
    // ================================
    // Hooks
    // ================================
    const { setView, setParentId } = useLabelUpsertModal();

    const handleSelect = (labelId: string | null) => {
        setParentId(labelId);
        setView('form');
    };

    return (
        <div>
            <LabelSelectorContent onSelect={handleSelect} />
        </div>
    );
};

interface LabelUpsertParentBadgeProps {
    className?: string;
    currentParentId?: string | null;
    setParentId: (parentId: string | null) => void;
}

export const LabelUpsertParentBadge: React.FC<LabelUpsertParentBadgeProps> = ({
    className,
    currentParentId,
    setParentId,
}) => {
    const { setView } = useLabelUpsertModal();

    const { data: labels = [] } = useLabelEndpoints.getAllFlattened({ query: { search: '' } });

    const parentLabel = labels.find((l) => l.id === currentParentId);

    if (!currentParentId) {
        return (
            <Button variant="outline" size="sm" onClick={() => setView('parent')}>
                Select Parent Label
            </Button>
        );
    }

    if (!parentLabel) {
        return null;
    }

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <LabelBadge label={parentLabel} />
            <Button variant="ghost" size="sm" onClick={() => setView('parent')}>
                <Edit className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setParentId(null)}>
                <X className="size-4" />
            </Button>
        </div>
    );
};
