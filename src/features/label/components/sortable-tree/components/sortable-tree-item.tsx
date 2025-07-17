import React, { useMemo, type CSSProperties } from 'react';
import { useSortable, type AnimateLayoutChanges } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TreeItem } from './tree-item';
import type { TreeItemProps } from '../types';

// Detect iOS for performance optimization
const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

interface SortableTreeItemProps extends TreeItemProps {
    // Additional props for sortable functionality
}

const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting, wasDragging }) =>
    isSorting || wasDragging ? false : true;

export const SortableTreeItem = React.memo<SortableTreeItemProps>(({ id, ...props }) => {
    const {
        attributes,
        isDragging,
        isSorting,
        listeners,
        setDraggableNodeRef,
        setDroppableNodeRef,
        transform,
        transition,
    } = useSortable({
        id,
        animateLayoutChanges,
    });

    const style = useMemo(
        (): CSSProperties => ({
            transform: CSS.Translate.toString(transform),
            transition,
        }),
        [transform, transition]
    );

    const handleProps = useMemo(
        () => ({
            ...attributes,
            ...listeners,
        }),
        [attributes, listeners]
    );

    return (
        <TreeItem
            ref={setDraggableNodeRef}
            wrapperRef={setDroppableNodeRef}
            style={style}
            id={id}
            ghost={isDragging}
            disableSelection={isIOS}
            disableInteraction={isSorting}
            handleProps={handleProps}
            {...props}
        />
    );
});

SortableTreeItem.displayName = 'SortableTreeItem';