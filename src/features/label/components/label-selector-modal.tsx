'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLabelEndpoints } from '@/features/label/api';

import { useLabelSelectorModal } from '@/features/label/hooks';
import type { TLabelService } from '@/features/label/schemas';
import { useTransactionEndpoints } from '@/features/transaction/api';
import { cn } from '@/lib/utils';
import { renderLabelIcon } from '@/lib/utils/icon-renderer';
import { IconArrowLeft } from '@tabler/icons-react';
import { ChevronRightIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

interface LabelSelectorProps {
    className?: string;
}

interface LabelItemProps {
    label: TLabelService['selectFlattened'];
    selectedLabelId?: string | null;
    onSelect: (labelId: string) => void;
    onExpand?: (parentId: string) => void;
}

const LabelItem = ({ label, selectedLabelId, onSelect, onExpand }: LabelItemProps) => {
    const isSelected = selectedLabelId === label.id;

    const handleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        onExpand?.(label.id);
    };

    return (
        <Button
            asChild
            onClick={() => onSelect(label.id)}
            style={{ backgroundColor: label.color || '#6B7280', color: 'white' }}
            className={cn('rounded-md w-full justify-start h-10 space-y-1')}
        >
            <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium">
                <div className="flex items-center gap-2">
                    {renderLabelIcon(label.icon, 'w-4 h-4')}
                    {label.name}
                </div>
                {onExpand && label.hasChildren && (
                    <Button variant="ghost" size="icon" className="ml-auto" onClick={handleExpand}>
                        <ChevronRightIcon className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </Button>
    );
};

export const LabelSelectorModal = ({ className }: LabelSelectorProps) => {
    const { isOpen, close, transactionId, labelId, setOpen, parentId, setParentId } =
        useLabelSelectorModal();

    const [searchTerm, setSearchTerm] = useState('');
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

    // const { data: rootLabels = [] } = useLabelEndpoints.getRoots({});
    const { data: allLabels = [] } = useLabelEndpoints.getAllFlattened({
        query: {
            search: searchTerm,
        },
    });
    // const { data: allLabels = [] } = useLabelEndpoints.getAll(
    //     {
    //         query: {
    //             search: searchTerm,
    //         },
    //     },
    //     {
    //         enabled: isSearchEnabled,
    //     }
    // );

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
        updateTransactionMutation.mutate({
            param: {
                id: transactionId,
            },
            json: {
                labelId,
            },
        });
        close();
    };

    return (
        <ResponsiveModal
            open={isOpen}
            onOpenChange={setOpen}
            title="Select Label"
            description="Choose a label to categorize this transaction"
            className={className}
            size="lg"
        >
            <div className="space-y-4">
                <Input
                    placeholder="Search labels..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    autoFocus
                />

                {selectedLabel && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Current:</span>
                            <Badge
                                style={{
                                    backgroundColor: selectedLabel.color || '#6B7280',
                                    color: 'white',
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium"
                            >
                                {renderLabelIcon(selectedLabel.icon, 'w-4 h-4')}
                                {selectedLabel.name}
                            </Badge>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleSelect(null)}>
                            Clear
                        </Button>
                    </div>
                )}

                {parentId && (
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
                            <span className="text-sm text-muted-foreground">
                                Current: {parentLabel?.name}
                            </span>
                        </div>
                    </div>
                )}

                <ScrollArea className="h-96">
                    <div className="space-y-1">
                        {labels.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {searchTerm
                                    ? 'No labels found matching your search.'
                                    : 'No labels available.'}
                            </div>
                        ) : (
                            labels.map((label) => (
                                <LabelItem
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
        </ResponsiveModal>
    );
};
