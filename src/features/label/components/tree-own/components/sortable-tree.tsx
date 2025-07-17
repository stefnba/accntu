'use client';

import { SortableItem } from '@/features/label/components/tree-own/components/sortable-item';
import { FlattenedItem, type TreeItem } from '@/features/label/components/tree-own/types';
import { flattenTree } from '@/features/label/components/tree-own/utils';
import {
    DndContext,
    DragEndEvent,
    DragMoveEvent,
    DragStartEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMemo, useState } from 'react';

interface SortableTreeProps {
    defaultItems: TreeItem[];
}

export const SortableTreeOwn: React.FC<SortableTreeProps> = ({ defaultItems }) => {
    const [items, setItems] = useState(() => defaultItems);

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    // ====================
    // Tree items
    // ====================

    const flattenedItems: FlattenedItem[] = useMemo(() => {
        const flattened = flattenTree(items);
        return flattened;
    }, [items]);

    console.log(flattenedItems);

    // ====================
    // Handlers
    // ====================

    const handleDragStart = ({ active }: DragStartEvent) => {
        console.log('handleDragStart', active);
    };

    const handleDragMove = ({ active }: DragMoveEvent) => {
        console.log('handleDragMove', active);
    };

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) {
            return;
        }

        const activeIndex = flattenedItems.findIndex((item) => item.id === active.id);
        const overIndex = flattenedItems.findIndex((item) => item.id === over.id);

        if (activeIndex !== -1 && overIndex !== -1) {
            const newItems = arrayMove(items, activeIndex, overIndex);
            setItems(newItems);
        }
    };

    const handleDragCancel = () => {
        console.log('handleDragCancel');
    };

    // ====================
    // Render
    // ====================

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <SortableContext
                items={flattenedItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
            >
                {flattenedItems.map((item) => (
                    <SortableItem key={item.id} item={item} />
                ))}
            </SortableContext>
        </DndContext>
    );
};
