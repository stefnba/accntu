'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLabelEndpoints } from '@/features/label/api';
import { LabelTreeItem } from '@/features/label/components/label-tree';
import { useLabelSelectorModal } from '@/features/label/hooks';
import type { TLabelQuery } from '@/features/label/schemas';
import { useTransactionEndpoints } from '@/features/transaction/api';
import { cn } from '@/lib/utils';
import { renderLabelIcon } from '@/lib/utils/icon-renderer';
import { useMemo, useState } from 'react';

interface LabelSelectorProps {
    className?: string;
}

interface LabelHierarchyItemProps {
    label: TLabelQuery['select'] & { parentPath?: string };
    selectedLabelId?: string;
    onSelect: (labelId: string) => void;
    searchTerm: string;
}

const LabelHierarchyItem = ({
    label,
    selectedLabelId,
    onSelect,
    searchTerm,
}: LabelHierarchyItemProps) => {
    const isSelected = selectedLabelId === label.id;
    const isHighlighted = searchTerm && label.name.toLowerCase().includes(searchTerm.toLowerCase());

    return (
        <Button
            variant={isSelected ? 'default' : 'ghost'}
            onClick={() => onSelect(label.id)}
            className={cn(
                'w-full justify-start h-auto p-3 space-y-1',
                isHighlighted && !isSelected && 'bg-yellow-50 border-yellow-200'
            )}
        >
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                    <Badge
                        style={{ backgroundColor: label.color || '#6B7280', color: 'white' }}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium"
                    >
                        {renderLabelIcon(label.icon, 'w-4 h-4')}
                        {label.name}
                    </Badge>
                </div>
            </div>

            {label.parentPath && (
                <div className="text-xs text-muted-foreground w-full text-left">
                    {label.parentPath}
                </div>
            )}
        </Button>
    );
};

export const LabelSelectorModal = ({ className }: LabelSelectorProps) => {
    const { isOpen, close, transactionId, labelId, setOpen } = useLabelSelectorModal();

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

    const { data: rootLabels = [] } = useLabelEndpoints.getRoots({});
    const { data: allLabels = [] } = useLabelEndpoints.getAll(
        {
            query: {
                search: searchTerm,
            },
        },
        {
            enabled: isSearchEnabled,
        }
    );

    // =========================
    // Others
    // =========================

    const labels = useMemo(() => {
        return isSearchEnabled ? allLabels : rootLabels;
    }, [searchTerm, allLabels, rootLabels]);

    const flatLabelsWithHierarchy = useMemo(() => {
        const buildHierarchy = (
            allLabels: TLabelQuery['select'][],
            label: TLabelQuery['select'],
            path: string[] = []
        ): TLabelQuery['select'] & { parentPath?: string } => {
            const newPath = [...path, label.name];
            const parentPath = path.length > 0 ? path.join(' → ') : undefined;

            return {
                ...label,
                parentPath,
            };
        };

        const buildFlatList = (
            allLabels: TLabelQuery['select'][],
            parentId?: string,
            path: string[] = []
        ): (TLabelQuery['select'] & { parentPath?: string })[] => {
            const childLabels = allLabels.filter((l) => l.parentId === (parentId || null));
            const result: (TLabelQuery['select'] & { parentPath?: string })[] = [];

            for (const label of childLabels) {
                const labelWithPath = buildHierarchy(allLabels, label, path);
                result.push(labelWithPath);

                const children = buildFlatList(allLabels, label.id, [...path, label.name]);
                result.push(...children);
            }

            return result;
        };

        return buildFlatList(labels);
    }, [labels]);

    if (!transactionId) {
        return <div>No transaction selected</div>;
    }

    const selectedLabel = labels.find((l) => l.id === labelId || transaction?.labelId);

    // =========================
    // Handlers
    // =========================

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
                                <LabelTreeItem
                                    key={label.id}
                                    label={label}
                                    onSelect={handleSelect}
                                    showChildren={!isSearchEnabled}
                                />
                                // <LabelHierarchyItem
                                //     key={label.id}
                                //     label={label}
                                //     selectedLabelId={labelId ?? undefined}
                                //     onSelect={handleSelect}
                                //     searchTerm={searchTerm}
                                // />
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
        </ResponsiveModal>
    );
};
