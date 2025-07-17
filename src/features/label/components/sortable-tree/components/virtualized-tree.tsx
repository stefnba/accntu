import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { SortableTreeItem } from './sortable-tree-item';
import { useFlattenedItems, useActiveId, useToggleCollapse, useRemoveItem } from '../store/tree-store';
import { getProjection } from '../utils/tree-utils';
import { VIRTUALIZATION_CONFIG } from '../utils/constants';
import type { SortableTreeProps } from '../types';

// Optional react-window import with fallback
let List: any = null;
let ListChildComponentProps: any = null;

try {
    const reactWindow = require('react-window');
    List = reactWindow.FixedSizeList;
    ListChildComponentProps = reactWindow.ListChildComponentProps;
} catch (error) {
    // react-window is not installed, virtualization will be disabled
    console.warn('react-window is not installed. VirtualizedTree will fall back to regular rendering.');
}

interface VirtualizedTreeProps extends SortableTreeProps {
    maxHeight?: number;
    itemHeight?: number;
    overscanCount?: number;
}

interface VirtualizedItemData {
    items: Array<{
        id: string;
        value: string;
        depth: number;
        collapsed: boolean;
        hasChildren: boolean;
    }>;
    activeId: string | null;
    projected: any;
    indentationWidth: number;
    indicator: boolean;
    collapsible: boolean;
    removable: boolean;
    onCollapse?: (id: string) => void;
    onRemove?: (id: string) => void;
}

const VirtualizedItem = React.memo(({ index, style, data }: any) => {
    const {
        items,
        activeId,
        projected,
        indentationWidth,
        indicator,
        collapsible,
        removable,
        onCollapse,
        onRemove,
    } = data;

    const item = items[index];
    if (!item) return null;

    const { id, value, depth, collapsed, hasChildren } = item;

    return (
        <div style={style}>
            <SortableTreeItem
                id={id}
                value={value}
                depth={id === activeId && projected ? projected.depth : depth}
                indentationWidth={indentationWidth}
                indicator={indicator}
                collapsed={Boolean(collapsed && hasChildren)}
                onCollapse={
                    collapsible && hasChildren && onCollapse
                        ? () => onCollapse(id)
                        : undefined
                }
                onRemove={
                    removable && onRemove
                        ? () => onRemove(id)
                        : undefined
                }
            />
        </div>
    );
});

VirtualizedItem.displayName = 'VirtualizedItem';

export const VirtualizedTree = React.memo<VirtualizedTreeProps>(({
    collapsible = false,
    indicator = false,
    indentationWidth = 50,
    removable = false,
    maxHeight = VIRTUALIZATION_CONFIG.defaultHeight,
    itemHeight = VIRTUALIZATION_CONFIG.itemHeight,
    overscanCount = VIRTUALIZATION_CONFIG.overscanCount,
}) => {
    const flattenedItems = useFlattenedItems();
    const activeId = useActiveId();
    const toggleCollapse = useToggleCollapse();
    const removeItem = useRemoveItem();
    const listRef = useRef<List>(null);

    // Transform flattened items for virtualization
    const virtualizedItems = useMemo(() => {
        return flattenedItems.map(item => ({
            id: String(item.id),
            value: String(item.id),
            depth: item.depth,
            collapsed: Boolean(item.collapsed),
            hasChildren: item.children.length > 0,
        }));
    }, [flattenedItems]);

    // Calculate projected depth for active item
    const projected = useMemo(() => {
        if (!activeId) return null;
        
        const activeItem = flattenedItems.find(item => item.id === activeId);
        if (!activeItem) return null;

        // This would need the actual overId and offsetLeft from the main tree
        // For now, return the current depth
        return { depth: activeItem.depth };
    }, [activeId, flattenedItems]);

    // Handlers
    const handleCollapse = useCallback((id: string) => {
        toggleCollapse(id);
    }, [toggleCollapse]);

    const handleRemove = useCallback((id: string) => {
        removeItem(id);
    }, [removeItem]);

    // Scroll to active item when dragging starts
    useEffect(() => {
        if (activeId && listRef.current) {
            const activeIndex = virtualizedItems.findIndex(item => item.id === activeId);
            if (activeIndex !== -1) {
                listRef.current.scrollToItem(activeIndex, 'smart');
            }
        }
    }, [activeId, virtualizedItems]);

    const itemData = useMemo((): VirtualizedItemData => ({
        items: virtualizedItems,
        activeId: activeId ? String(activeId) : null,
        projected,
        indentationWidth,
        indicator,
        collapsible,
        removable,
        onCollapse: handleCollapse,
        onRemove: handleRemove,
    }), [
        virtualizedItems,
        activeId,
        projected,
        indentationWidth,
        indicator,
        collapsible,
        removable,
        handleCollapse,
        handleRemove,
    ]);

    if (virtualizedItems.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 text-gray-500">
                No items to display
            </div>
        );
    }

    // Fallback to regular rendering if react-window is not available
    if (!List) {
        return (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                    className="overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                    style={{ maxHeight: maxHeight }}
                >
                    {virtualizedItems.map((item, index) => (
                        <div key={item.id} style={{ height: itemHeight }}>
                            <SortableTreeItem
                                id={item.id}
                                value={item.value}
                                depth={item.id === activeId && projected ? projected.depth : item.depth}
                                indentationWidth={indentationWidth}
                                indicator={indicator}
                                collapsed={Boolean(item.collapsed && item.hasChildren)}
                                onCollapse={
                                    collapsible && item.hasChildren && handleCollapse
                                        ? () => handleCollapse(item.id)
                                        : undefined
                                }
                                onRemove={
                                    removable && handleRemove
                                        ? () => handleRemove(item.id)
                                        : undefined
                                }
                            />
                        </div>
                    ))}
                </div>
                <div className="text-xs text-amber-600 p-2 bg-amber-50 border-t border-amber-200">
                    ⚠️ Install react-window for better performance with large lists
                </div>
            </div>
        );
    }

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <List
                ref={listRef}
                height={Math.min(maxHeight, virtualizedItems.length * itemHeight)}
                itemCount={virtualizedItems.length}
                itemSize={itemHeight}
                itemData={itemData}
                overscanCount={overscanCount}
                className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            >
                {VirtualizedItem}
            </List>
        </div>
    );
});

VirtualizedTree.displayName = 'VirtualizedTree';