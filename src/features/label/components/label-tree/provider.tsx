'use client';

import type { TLabelQuery } from '@/features/label/schemas';
import { createContext, useContext, useState } from 'react';

export interface LabelTreeConfig {
    showChildren?: boolean;
    onSelect?: (labelId: string) => void;
    showActions?: boolean;
    level?: number;
}

export interface LabelTreeState {
    expandedItems: Set<string>;
    toggleExpanded: (labelId: string) => void;
    isExpanded: (labelId: string) => boolean;
}

export interface LabelTreeContextValue extends LabelTreeConfig, LabelTreeState {
    currentLabel?: TLabelQuery['select'] & { children?: TLabelQuery['select'][] };
    currentLevel: number;
}

export interface LabelTreeProviderProps extends LabelTreeConfig {
    children: React.ReactNode;
    label?: TLabelQuery['select'] & { children?: TLabelQuery['select'][] };
    level?: number;
}

// Context
const LabelTreeContext = createContext<LabelTreeContextValue | null>(null);

/**
 * Hook to access the label tree context.
 *
 * @returns The label tree context.
 */
export const useLabelTreeContext = () => {
    const context = useContext(LabelTreeContext);
    if (!context) {
        throw new Error('LabelTree components must be used within a LabelTreeProvider');
    }
    return context;
};

/**
 * Provider component for the label tree.
 */
export function LabelTreeProvider({
    children,
    label,
    level = 0,
    showChildren = true,
    onSelect,
    showActions = true,
}: LabelTreeProviderProps) {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const toggleExpanded = (labelId: string) => {
        setExpandedItems((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(labelId)) {
                newSet.delete(labelId);
            } else {
                newSet.add(labelId);
            }
            return newSet;
        });
    };

    const isExpanded = (labelId: string) => expandedItems.has(labelId);

    const contextValue: LabelTreeContextValue = {
        showChildren,
        onSelect,
        showActions,
        currentLevel: level,
        currentLabel: label,
        expandedItems,
        toggleExpanded,
        isExpanded,
    };

    return <LabelTreeContext.Provider value={contextValue}>{children}</LabelTreeContext.Provider>;
}
