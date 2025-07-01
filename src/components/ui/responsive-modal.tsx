'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    auto: 'w-auto sm:max-w-[90vw] max-w-3xl',
};

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    title?: string;
    description?: string;
    size?: keyof typeof sizeClasses;
    className?: string;
}

/**
 * A responsive modal component that uses a dialog for desktop and a drawer for mobile.
 * @param children - The content to display in the modal.
 * @param open - Whether the modal is open.
 * @param onOpenChange - The function to call when the modal is opened or closed.
 * @param size - The size of the modal, supporting responsive presets and an 'auto' mode for content-based sizing. Defaults to 'lg'.
 * @param className - Additional class names to apply to the modal content for custom styling.
 */
export const ResponsiveModal: React.FC<Props> = ({
    children,
    title,
    description,
    open,
    onOpenChange,
    size = 'auto',
    className,
}) => {
    const isMobile = useIsMobile();

    const contentClasses = cn(
        'p-4 border-none overflow-y-auto max-h-[85vh] transition-all duration-300 ease-in-out',
        size !== 'auto' && 'w-full',
        sizeClasses[size],
        className
    );

    if (!isMobile) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className={contentClasses}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    {children}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className={cn('pb-4 px-4', className)}>
                <DrawerHeader>
                    <DrawerTitle>{title}</DrawerTitle>
                    <DrawerDescription>{description}</DrawerDescription>
                </DrawerHeader>
                <div className="overflow-y-auto hide-scrollbar max-h-[85vh] pt-4">{children}</div>
            </DrawerContent>
        </Drawer>
    );
};
