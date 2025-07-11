'use client';

import type { TLabelQuery } from '@/features/label/schemas';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Types
export interface LabelTreeConfig {
    onSelect?: (labelId: string) => void;
    level?: number;
}

export interface LabelTreeState {
    expandedLabelIds: Set<string>;
    toggleExpandedLabelId: (labelId: string) => void;
    isExpandedLabelId: (labelId: string) => boolean;
}

export interface LabelTreeData {
    currentLabel?: TLabelQuery['select'] & { children?: TLabelQuery['select'][] };
    currentLevel: number;
}

export interface LabelTreeProviderProps extends LabelTreeConfig {
    children: React.ReactNode;
    label?: TLabelQuery['select'] & { children?: TLabelQuery['select'][] };
    level?: number;
}

// Split contexts for better performance
const LabelTreeStateContext = createContext<LabelTreeState | null>(null);
const LabelTreeConfigContext = createContext<LabelTreeConfig | null>(null);
const LabelTreeDataContext = createContext<LabelTreeData | null>(null);

export const useLabelTreeState = () => {
    const context = useContext(LabelTreeStateContext);
    if (!context) {
        throw new Error('useLabelTreeState must be used within a LabelTreeProvider');
    }
    return context;
};

export const useLabelTreeConfig = () => {
    const context = useContext(LabelTreeConfigContext);
    if (!context) {
        throw new Error('useLabelTreeConfig must be used within a LabelTreeProvider');
    }
    return context;
};

export const useLabelTreeData = () => {
    const context = useContext(LabelTreeDataContext);
    if (!context) {
        throw new Error('useLabelTreeData must be used within a LabelTreeProvider');
    }
    return context;
};

// Legacy hook that combines all contexts
export const useLabelTreeContext = () => {
    const state = useLabelTreeState();
    const config = useLabelTreeConfig();
    const data = useLabelTreeData();

    return useMemo(
        () => ({
            ...state,
            ...config,
            ...data,
        }),
        [state, config, data]
    );
};

// Provider Component
export const LabelTreeItemProvider = ({
    children,
    label,
    level = 0,
    onSelect,
}: LabelTreeProviderProps) => {
    const [expandedLabelIds, setExpandedLabelIds] = useState<Set<string>>(new Set());

    const toggleExpandedLabelId = useCallback((labelId: string) => {
        setExpandedLabelIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(labelId)) {
                newSet.delete(labelId);
            } else {
                newSet.add(labelId);
            }
            return newSet;
        });
    }, []);

    const isExpandedLabelId = useCallback(
        (labelId: string) => expandedLabelIds.has(labelId),
        [expandedLabelIds]
    );

    // Memoize context values to prevent unnecessary re-renders
    const stateValue = useMemo<LabelTreeState>(
        () => ({
            expandedLabelIds,
            toggleExpandedLabelId,
            isExpandedLabelId,
        }),
        [expandedLabelIds, toggleExpandedLabelId, isExpandedLabelId]
    );

    const configValue = useMemo<LabelTreeConfig>(
        () => ({
            onSelect,
        }),
        [onSelect]
    );

    const dataValue = useMemo<LabelTreeData>(
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
