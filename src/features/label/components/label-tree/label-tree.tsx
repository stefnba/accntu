'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLabelEndpoints } from '../../api';
import { LabelTreeItem } from './label-tree-item';
import { LabelTreeRoot } from './label-tree-root';
import { LabelTreeProvider } from './provider';

export interface LabelTreeProps {
    className?: string;
    onSelect?: (labelId: string) => void;
    showActions?: boolean;
}

export const LabelTree = ({ className, onSelect, showActions = true }: LabelTreeProps) => {
    const { data: labels, isLoading } = useLabelEndpoints.getRoots({});

    if (isLoading) {
        return <div className="p-4">Loading labels...</div>;
    }

    if (!labels || labels.length === 0) {
        return (
            <Card className={cn('text-center py-8 text-gray-500', className)}>
                No labels found. Create your first label to get started.
            </Card>
        );
    }

    return (
        <LabelTreeProvider onSelect={onSelect} showActions={showActions}>
            <LabelTreeRoot className={className}>
                {labels.map((label) => (
                    <LabelTreeItem key={label.id} label={label} />
                ))}
            </LabelTreeRoot>
        </LabelTreeProvider>
    );
};
