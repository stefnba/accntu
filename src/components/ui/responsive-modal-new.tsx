'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

interface ResponsiveModalContextValue {
    isMobile: boolean;
}

const ResponsiveModalContext = createContext<ResponsiveModalContextValue | null>(null);

const useResponsiveModal = () => {
    const context = useContext(ResponsiveModalContext);
    if (!context) {
        throw new Error('ResponsiveModal compound components must be used within ResponsiveModal');
    }
    return context;
};

const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    auto: 'sm:max-w-[min(90vw,800px)]',
} as const;

type ModalSize = keyof typeof sizeClasses;

interface ResponsiveModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
    size?: ModalSize;
    className?: string;
}

export const ResponsiveModal = ({
    open,
    onOpenChange,
    children,
    size = 'auto',
    className,
}: ResponsiveModalProps) => {
    const isMobile = useIsMobile();

    const content = (
        <ResponsiveModalContext.Provider value={{ isMobile }}>
            {children}
        </ResponsiveModalContext.Provider>
    );

    if (!isMobile) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className={cn('p-0 gap-0', sizeClasses[size], className)}>
                    {content}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className={cn(className)}>{content}</DrawerContent>
        </Drawer>
    );
};

interface HeaderProps {
    children: ReactNode;
    className?: string;
}

ResponsiveModal.Header = ({ children, className }: HeaderProps) => {
    const { isMobile } = useResponsiveModal();
    const Component = isMobile ? DrawerHeader : DialogHeader;
    return <Component className={cn('p-4', className)}>{children}</Component>;
};

interface TitleProps {
    children: ReactNode;
    className?: string;
}

ResponsiveModal.Title = ({ children, className }: TitleProps) => {
    const { isMobile } = useResponsiveModal();
    const Component = isMobile ? DrawerTitle : DialogTitle;
    return <Component className={className}>{children}</Component>;
};

interface DescriptionProps {
    children: ReactNode;
    className?: string;
}

ResponsiveModal.Description = ({ children, className }: DescriptionProps) => {
    const { isMobile } = useResponsiveModal();
    const Component = isMobile ? DrawerDescription : DialogDescription;
    return <Component className={className}>{children}</Component>;
};

interface ContentProps {
    children: ReactNode;
    className?: string;
    scrollable?: boolean;
}

ResponsiveModal.Content = ({ children, className, scrollable = true }: ContentProps) => {
    const { isMobile } = useResponsiveModal();

    return (
        <div
            className={cn(
                // isMobile ? 'px-4 pb-4' : 'px-4 pb-4',
                'p-4',
                scrollable && 'overflow-y-auto max-h-[70vh]',
                className
            )}
        >
            {children}
        </div>
    );
};

interface FooterProps {
    children: ReactNode;
    className?: string;
}

ResponsiveModal.Footer = ({ children, className }: FooterProps) => {
    const { isMobile } = useResponsiveModal();
    const Component = isMobile ? DrawerFooter : DialogFooter;

    return (
        <Component className={cn('p-4', !isMobile && 'border-t ', className)}>{children}</Component>
    );
};

export type {
    ContentProps,
    DescriptionProps,
    FooterProps,
    HeaderProps,
    ModalSize,
    ResponsiveModalProps,
    TitleProps,
};
