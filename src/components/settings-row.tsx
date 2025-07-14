import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import React, { Children } from 'react';

/**
 * Container for Settings Row Section, adds a separator between each child
 */
export const SettingsRowSection: React.FC<React.ComponentProps<'div'>> = ({
    className,
    children,
    ...props
}) => {
    if (children && Array.isArray(children)) {
        const arrayChildren = Children.toArray(children);
        return (
            <div {...props} className={cn('flex flex-col gap-2', className)}>
                {arrayChildren.map((child, index) => (
                    <React.Fragment key={index}>
                        {child}
                        {index < arrayChildren.length - 1 && <Separator />}
                    </React.Fragment>
                ))}
            </div>
        );
    }
    return (
        <div {...props} className={cn('flex flex-col gap-2', className)}>
            {children}
        </div>
    );
};

export const SettingsRow: React.FC<React.ComponentProps<'div'>> = ({ className, ...props }) => {
    return <div {...props} className={cn('flex items-center justify-between py-4', className)} />;
};

export const SettingsRowHeader: React.FC<React.ComponentProps<'div'>> = ({
    className,
    ...props
}) => {
    return <div {...props} className={cn('flex-1 space-y-1', className)} />;
};

export const SettingsRowActions: React.FC<React.ComponentProps<'div'>> = ({
    className,
    ...props
}) => {
    return <div {...props} className={cn('flex items-center justify-between', className)} />;
};

export const SettingsRowTitle: React.FC<React.ComponentProps<'div'>> = ({
    className,
    ...props
}) => {
    return <div {...props} className={cn('leading-none font-medium', className)} />;
};

export const SettingsRowDescription: React.FC<React.ComponentProps<'div'>> = ({
    className,
    ...props
}) => {
    return (
        <div {...props} className={cn('text-sm leading-none text-muted-foreground', className)} />
    );
};
