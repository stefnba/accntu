'use client';

import { LabelTreeStateContext, LabelTreeConfigContext, LabelTreeDataContext } from './provider';
import type { LabelTreeItem } from './tree-utilities';
import { useMemo } from 'react';

interface SortableLabelTreeItemProviderProps {
    children: React.ReactNode;
    label: LabelTreeItem;
    level: number;
    onSelect?: (labelId: string) => void;
    expandedLabelIds: Set<string>;
    toggleExpandedLabelId: (labelId: string) => void;
    isExpandedLabelId: (labelId: string) => boolean;
}

export const SortableLabelTreeItemProvider = ({
    children,
    label,
    level,
    onSelect,
    expandedLabelIds,
    toggleExpandedLabelId,
    isExpandedLabelId,
}: SortableLabelTreeItemProviderProps) => {
    // Memoize context values to prevent unnecessary re-renders
    const stateValue = useMemo(
        () => ({
            expandedLabelIds,
            toggleExpandedLabelId,
            isExpandedLabelId,
        }),
        [expandedLabelIds, toggleExpandedLabelId, isExpandedLabelId]
    );

    const configValue = useMemo(
        () => ({
            onSelect,
        }),
        [onSelect]
    );

    const dataValue = useMemo(
        () => ({
            currentLabel: label,
            currentLevel: level,
        }),
        [label, level]
    );

    return (
        <LabelTreeStateContext.Provider value={stateValue}>
            <LabelTreeConfigContext.Provider value={configValue}>
                <LabelTreeDataContext.Provider value={dataValue}>
                    {children}
                </LabelTreeDataContext.Provider>
            </LabelTreeConfigContext.Provider>
        </LabelTreeStateContext.Provider>
    );
};