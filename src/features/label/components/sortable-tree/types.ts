import type { UniqueIdentifier } from '@dnd-kit/core';
import type { MutableRefObject, HTMLAttributes, CSSProperties } from 'react';

export interface TreeItem {
    id: UniqueIdentifier;
    children: TreeItem[];
    collapsed?: boolean;
}

export type TreeItems = TreeItem[];

export interface FlattenedItem extends TreeItem {
    parentId: UniqueIdentifier | null;
    depth: number;
    index: number;
}

export type SensorContext = MutableRefObject<{
    items: FlattenedItem[];
    offset: number;
}>;

export interface TreeProjection {
    depth: number;
    maxDepth: number;
    minDepth: number;
    parentId: UniqueIdentifier | null;
}


export interface SortableTreeProps {
    collapsible?: boolean;
    defaultItems?: TreeItems;
    indentationWidth?: number;
    indicator?: boolean;
    removable?: boolean;
    virtualized?: boolean;
    maxHeight?: number;
    onItemsChange?: (items: TreeItems) => void;
}

export interface TreeItemProps extends Omit<HTMLAttributes<HTMLLIElement>, 'id'> {
    id: UniqueIdentifier;
    value: string;
    depth: number;
    childCount?: number;
    clone?: boolean;
    collapsed?: boolean;
    disableInteraction?: boolean;
    disableSelection?: boolean;
    ghost?: boolean;
    handleProps?: Record<string, unknown>;
    indicator?: boolean;
    indentationWidth: number;
    onCollapse?: () => void;
    onRemove?: () => void;
    wrapperRef?: (node: HTMLLIElement) => void;
}

export interface TreeActionProps extends HTMLAttributes<HTMLButtonElement> {
    active?: {
        fill: string;
        background: string;
    };
    cursor?: CSSProperties['cursor'];
}