import { MeasuringStrategy, DropAnimation } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { TreeItems } from '../types';

export const DEFAULT_INDENTATION_WIDTH = 50;

// Store configuration
export const TREE_STORE_CONFIG = {
    name: 'sortable-tree',
    defaultIndentationWidth: DEFAULT_INDENTATION_WIDTH,
} as const;

export const DEFAULT_ITEMS: TreeItems = [
    {
        id: 'Home',
        children: [],
    },
    {
        id: 'Collections',
        children: [
            { id: 'Spring', children: [] },
            { id: 'Summer', children: [] },
            { id: 'Fall', children: [] },
            { id: 'Winter', children: [] },
        ],
    },
    {
        id: 'About Us',
        children: [],
    },
    {
        id: 'My Account',
        children: [
            { id: 'Addresses', children: [] },
            { id: 'Order History', children: [] },
        ],
    },
];

export const MEASURING_CONFIG = {
    droppable: {
        strategy: MeasuringStrategy.Always,
    },
};

export const DROP_ANIMATION_CONFIG: DropAnimation = {
    keyframes({ transform }) {
        return [
            { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
            {
                opacity: 0,
                transform: CSS.Transform.toString({
                    ...transform.final,
                    x: transform.final.x + 5,
                    y: transform.final.y + 5,
                }),
            },
        ];
    },
    easing: 'ease-out',
    sideEffects({ active }) {
        active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: 200,
            easing: 'ease-out',
        });
    },
};

export const TREE_ITEM_STYLES = {
    verticalPadding: {
        root: '6px',
        nested: '4px',
    },
    colors: {
        border: 'border-gray-300',
        background: 'bg-white',
        text: 'text-gray-800',
        hover: 'hover:bg-gray-50',
        focus: 'focus:ring-1 focus:ring-blue-500',
        ghost: 'opacity-50',
        indicator: 'border-blue-500 bg-blue-400',
    },
    transition: 'transition-all duration-200 ease-in-out',
} as const;

export const ACCESSIBILITY_LABELS = {
    dragHandle: 'Drag to reorder',
    collapseButton: 'Toggle collapse',
    removeButton: 'Remove item',
    treeItem: 'Tree item',
} as const;

export const VIRTUALIZATION_CONFIG = {
    itemHeight: 40,
    overscanCount: 5,
    defaultHeight: 400,
} as const;