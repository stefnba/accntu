'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
import { ALL_COLUMNS, useColumnManagement } from '../../hooks/transaction-column-management';

interface ColumnManagementModalProps {
    className?: string;
}

interface SortableColumnItemProps {
    column: (typeof ALL_COLUMNS)[0];
    isVisible: boolean;
    onToggle: (columnId: string) => void;
}

const SortableColumnItem = ({ column, isVisible, onToggle }: SortableColumnItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: column.id,
        disabled: !isVisible, // Disable dragging for hidden columns
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 p-3 border rounded-lg bg-card ${
                isDragging ? 'opacity-50' : ''
            } ${!isVisible ? 'opacity-60' : ''}`}
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
                    id={`column-${column.id}`}
                    checked={isVisible}
                    onCheckedChange={() => column.canHide && onToggle(column.id)}
                    disabled={!column.canHide}
                />
                <Label
                    htmlFor={`column-${column.id}`}
                    className={`flex-1 ${!column.canHide ? 'text-muted-foreground' : ''}`}
                >
                    {column.label}
                    {!column.canHide && <span className="text-xs ml-1">(Required)</span>}
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

export const ColumnManagementModal: React.FC<ColumnManagementModalProps> = () => {
    const {
        isOpen,
        close,
        columnOrder,
        setColumnOrder,
        toggleColumnVisibility,
        isColumnVisible,
        resetAll,
        getVisibleColumns,
        getHiddenColumns,
    } = useColumnManagement();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    /**
     * Handle the drag end event - only reorder visible columns
     *
     * @param event - The drag end event.
     */
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // Only allow reordering if both columns are visible
            const activeId = active.id as string;
            const overId = over.id as string;
            
            if (isColumnVisible(activeId) && isColumnVisible(overId)) {
                const oldIndex = columnOrder.indexOf(activeId);
                const newIndex = columnOrder.indexOf(overId);
                const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
                setColumnOrder(newOrder);
            }
        }
    };

    /**
     * Handle the reset event.
     */
    const handleReset = () => {
        resetAll();
    };

    const visibleCount = getVisibleColumns().length;
    const hiddenCount = getHiddenColumns().length;

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent className="max-w-md">
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
                    {/* Stats */}
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

                    {/* Column List */}
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
                                {columnOrder.map((columnId) => {
                                    const column = ALL_COLUMNS.find(col => col.id === columnId);
                                    if (!column) return null;
                                    
                                    return (
                                        <SortableColumnItem
                                            key={column.id}
                                            column={column}
                                            isVisible={isColumnVisible(column.id)}
                                            onToggle={toggleColumnVisibility}
                                        />
                                    );
                                })}
                                
                                {/* Show hidden columns at the end */}
                                {getHiddenColumns().map((columnId) => {
                                    const column = ALL_COLUMNS.find(col => col.id === columnId);
                                    if (!column) return null;
                                    
                                    return (
                                        <SortableColumnItem
                                            key={column.id}
                                            column={column}
                                            isVisible={false}
                                            onToggle={toggleColumnVisibility}
                                        />
                                    );
                                })}
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
        </Dialog>
    );
};
