'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ResponsiveModal } from '@/components/ui/responsive-modal';
import { Separator } from '@/components/ui/separator';
import { useTransactionTable } from '@/features/transaction/hooks';
import { useColumnManagementModal } from '@/features/transaction/hooks/column-management';
import {
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    IconEye,
    IconEyeOff,
    IconGripVertical,
    IconLayoutColumns,
    IconRefresh,
} from '@tabler/icons-react';
import { Column } from '@tanstack/react-table';
import { useMemo } from 'react';
import { TTransaction } from './table-columns';

interface SortableColumnItemProps {
    column: Column<TTransaction, unknown>;
    onToggle: (columnId: string) => void;
}

/**
 * A component that renders a sortable column item.
 * @param column - The column to render.
 * @param onToggle - The function to call when the column visibility is toggled.
 */
const SortableColumnItem = ({ column, onToggle }: SortableColumnItemProps) => {
    const { id, getCanHide, getIsVisible } = column;
    const isVisible = getIsVisible();
    const label =
        column.columnDef.meta?.label ||
        (typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        disabled: !isVisible, // Disable dragging for hidden columns
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging || !isVisible ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 p-3 border rounded-lg bg-card"
        >
            <div
                {...(isVisible ? { ...attributes, ...listeners } : {})}
                className={`p-1 rounded ${
                    isVisible
                        ? 'cursor-grab active:cursor-grabbing hover:bg-muted'
                        : 'cursor-not-allowed'
                }`}
            >
                <IconGripVertical className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex items-center space-x-2 flex-1">
                <Checkbox
                    id={`column-${id}`}
                    checked={isVisible}
                    onCheckedChange={() => getCanHide() && onToggle(id)}
                    disabled={!getCanHide()}
                />
                <Label
                    htmlFor={`column-${id}`}
                    className={`flex-1 ${!getCanHide() ? 'text-muted-foreground' : ''}`}
                >
                    {label}
                    {!getCanHide() && <span className="text-xs ml-1">(Required)</span>}
                </Label>
            </div>

            <div className="flex items-center">
                {isVisible ? (
                    <IconEye className="h-4 w-4 text-green-600" />
                ) : (
                    <IconEyeOff className="h-4 w-4 text-muted-foreground" />
                )}
            </div>
        </div>
    );
};

/**
 * A component that renders a modal for managing the column visibility and order.
 */
export const ColumnManagementModal: React.FC = () => {
    const { isOpen, close } = useColumnManagementModal();
    const { table, resetColumns } = useTransactionTable();

    const { getState, setColumnOrder, getAllLeafColumns } = table;
    const { columnOrder } = getState();

    const managedColumns = useMemo(() => {
        const columns = getAllLeafColumns().filter(
            (col) => col.id !== 'select' && col.id !== 'actions'
        );

        // Sort columns based on columnOrder
        return columns.sort((a, b) => {
            const aIndex = columnOrder.indexOf(a.id);
            const bIndex = columnOrder.indexOf(b.id);
            // Put columns not in order at the end
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });
    }, [getAllLeafColumns, columnOrder]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = columnOrder.indexOf(active.id as string);
            const newIndex = columnOrder.indexOf(over.id as string);
            setColumnOrder(arrayMove(columnOrder, oldIndex, newIndex));
        }
    };

    const handleReset = () => {
        resetColumns();
    };

    const toggleColumnVisibility = (columnId: string) => {
        table.getColumn(columnId)?.toggleVisibility();
    };

    const visibleCount = managedColumns.filter((c) => c.getIsVisible()).length;
    const hiddenCount = managedColumns.length - visibleCount;

    return (
        <ResponsiveModal open={isOpen} onOpenChange={close}>
            <DialogContent className="">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <IconLayoutColumns className="h-5 w-5" />
                        Manage Columns
                    </DialogTitle>
                    <DialogDescription>
                        Customize which columns are visible and their order. Drag and drop to
                        reorder columns.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                            {visibleCount} visible, {hiddenCount} hidden
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            className="h-8 px-2"
                        >
                            <IconRefresh className="h-3 w-3 mr-1" />
                            Reset
                        </Button>
                    </div>

                    <Separator />

                    <div className="max-h-96 overflow-y-auto space-y-2">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={columnOrder}
                                strategy={verticalListSortingStrategy}
                            >
                                {managedColumns.map((column) => (
                                    <SortableColumnItem
                                        key={column.id}
                                        column={column}
                                        onToggle={toggleColumnVisibility}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={close}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </ResponsiveModal>
    );
};
