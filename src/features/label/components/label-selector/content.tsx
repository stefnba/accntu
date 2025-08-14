'use client';

import { toast } from '@/components/feedback';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useLabelEndpoints } from '@/features/label/api';
import { LabelBadge } from '@/features/label/components/label-badge';
import { LabelListItem } from '@/features/label/components/label-selector/label-list-item';

import { useLabelSelectorModal } from '@/features/label/hooks';
import { useTransactionEndpoints } from '@/features/transaction/api';
import { cn } from '@/lib/utils';
import { IconArrowLeft } from '@tabler/icons-react';
import { useMemo, useState } from 'react';

interface LabelSelectorContentProps {
    className?: string;
}

export const LabelSelectorContent: React.FC<LabelSelectorContentProps> = ({ className }) => {
    // =========================
    // Hooks & State
    // =========================
    const [searchTerm, setSearchTerm] = useState('');
    const { transactionId, labelId, parentId, setParentId, closeModal } = useLabelSelectorModal();

    const SEARCH_TERM_MIN_LENGTH = 2;
    const isSearchEnabled = searchTerm.length > SEARCH_TERM_MIN_LENGTH;

    // =========================
    // API calls
    // =========================
    const updateTransactionMutation = useTransactionEndpoints.update();
    const { data: transaction } = useTransactionEndpoints.getById(
        {
            param: {
                id: transactionId!,
            },
        },
        {
            enabled: !!transactionId && !labelId,
        }
    );

    const { data: allLabels = [] } = useLabelEndpoints.getAllFlattened({
        query: {
            search: searchTerm,
        },
    });

    // =========================
    // Others
    // =========================

    const labels = useMemo(() => {
        return isSearchEnabled ? allLabels : allLabels.filter((l) => l.parentId === parentId);
    }, [searchTerm, allLabels, parentId]);

    const selectedLabel = allLabels.find((l) => l.id === labelId || transaction?.labelId);
    const parentLabel = useMemo(
        () => allLabels.find((l) => l.id === parentId),
        [allLabels, parentId]
    );

    // =========================
    // Handlers
    // =========================

    if (!transactionId) {
        return <div>No transaction selected</div>;
    }

    const handleSelect = (labelId: string | null) => {
        updateTransactionMutation.mutate(
            {
                param: {
                    id: transactionId,
                },
                json: {
                    labelId,
                },
            },
            {
                onSuccess: () => {
                    closeModal();
                    toast.success('Label selected successfully');
                },
            }
        );
    };

    return (
        <div className="space-y-4">
            {selectedLabel && (
                <div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Current:</span>
                            <LabelBadge
                                label={{
                                    id: selectedLabel.id,
                                    color: selectedLabel.color,
                                    name: selectedLabel.name,
                                    icon: selectedLabel.icon,
                                }}
                            />
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleSelect(null)}>
                            Clear
                        </Button>
                    </div>
                    <Separator className="my-6" />
                </div>
            )}

            <Input
                placeholder="Search labels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                autoFocus
            />

            {parentId && parentLabel && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <Button
                        className={cn('cursor-pointer', className)}
                        variant="outline"
                        size="sm"
                        onClick={() => setParentId(parentLabel?.parentId || null)}
                    >
                        <IconArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Parent:</span>
                        <LabelBadge
                            label={{
                                id: parentLabel.id,
                                color: parentLabel.color,
                                name: parentLabel.name,
                                icon: parentLabel.icon,
                            }}
                        />
                    </div>
                </div>
            )}

            <ScrollArea className="h-96">
                <div className="space-y-2">
                    {labels.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {searchTerm
                                ? 'No labels found matching your search.'
                                : 'No labels available.'}
                        </div>
                    ) : (
                        labels.map((label) => (
                            <LabelListItem
                                key={label.id}
                                label={label}
                                selectedLabelId={labelId}
                                onSelect={handleSelect}
                                onExpand={setParentId}
                            />
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};
