import { Badge } from '@/components/ui/badge';
import { TLabelQuery } from '@/features/label/schemas';
import { renderLabelIcon } from '@/lib/utils/icon-renderer';

interface LabelBadgeProps {
    label: TLabelQuery['select'];
    className?: string;
}

export const LabelBadge = ({ label, className }: LabelBadgeProps) => {
    return (
        <Badge
            style={{ backgroundColor: label.color || undefined, color: 'white' }}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-sm font-medium"
        >
            {renderLabelIcon(label.icon, 'size-4')}
            {label.name}
        </Badge>
    );
};
