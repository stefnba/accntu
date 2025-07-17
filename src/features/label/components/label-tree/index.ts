// Main component
export { LabelTree } from './label-tree';
export type { LabelTreeProps } from './label-tree';

// Core components
export { LabelTreeRoot } from './label-tree-root';
export type { LabelTreeRootProps } from './label-tree-root';

export {
    LabelTreeItem,
    LabelTreeItemBadge,
    LabelTreeItemButton,
    LabelTreeItemContent,
    LabelTreeItemHeader,
    LabelTreeItemIcon,
    LabelTreeItemTitle,
} from './label-tree-item';
export type { LabelTreeItemProps } from './label-tree-item';

export { LabelTreeChildren } from './label-tree-children';
export type { LabelTreeChildrenProps } from './label-tree-children';

// Action components
export { LabelTreeItemAction, LabelTreeItemActions } from './label-tree-actions';
export type { LabelTreeItemActionProps, LabelTreeItemActionsProps } from './label-tree-actions';

// Provider and context
export {
    LabelTreeItemProvider,
    useLabelTreeConfig,
    useLabelTreeContext,
    useLabelTreeData,
    useLabelTreeState,
} from './provider';
export type {
    LabelTreeConfig,
    LabelTreeData,
    LabelTreeProviderProps,
    LabelTreeState,
} from './provider';

// Sortable components
export { LabelTreeSortable } from './label-tree';
// export type { LabelTreeSortableProps } from './label-tree';

export { LabelTreeItemSortableWrapper, useDragHandle } from './item-sortable-wrapper';
export type { LabelTreeItemSortableWrapperProps } from './item-sortable-wrapper';

export { DragHandle } from './drag-handle';
export type { DragHandleProps } from './drag-handle';

// Tree utilities and drag indicators
export { DropIndicator } from './drop-indicator';
export type { DropIndicatorProps } from './drop-indicator';

export { SortableLabelTreeItemProvider } from './sortable-provider';

export * from './tree-utilities';
