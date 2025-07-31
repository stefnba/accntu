import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';
import { forwardRef } from 'react';

export interface DragHandleProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const DragHandleButton = forwardRef<HTMLButtonElement, DragHandleProps>(({ className, size = 'md', ...props }, ref) => {
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    return (
        <Button
            ref={ref}
            variant="ghost"
            size="icon"
            className={cn(
                'flex items-center justify-center p-1 rounded cursor-grab active:cursor-grabbing',
                'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
                'transition-all duration-150',
                'touch-none select-none', // Prevent text selection and touch scrolling
                className
            )}
            title="Drag to reorder"
            {...props}
        >
            <GripVertical className={sizeClasses[size]} />
        </Button>
    );
});

DragHandleButton.displayName = 'DragHandleButton';
