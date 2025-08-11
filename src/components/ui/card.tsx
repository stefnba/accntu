import { RoutePath } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import * as React from 'react';
import { IconType } from 'react-icons';

function Card({
    className,
    hoverable = false,
    ...props
}: React.ComponentProps<'div'> & { hoverable?: boolean }) {
    return (
        <div
            data-slot="card"
            className={cn(
                'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
                hoverable && 'hover:scale-105 hover:shadow-md transition-all duration-300',
                className
            )}
            {...props}
        />
    );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-header"
            className={cn('flex flex-col gap-1.5 px-6', className)}
            {...props}
        />
    );
}

const cardTitleVariants = cva('leading-none ', {
    variants: {
        size: {
            lg: 'text-lg font-semibold',
            xl: 'text-2xl font-semibold',
            default: 'font-medium',
        },
    },
    defaultVariants: {
        size: 'default',
    },
});

function CardTitle({
    className,
    size,
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof cardTitleVariants>) {
    return (
        <div
            data-slot="card-title"
            className={cn(cardTitleVariants({ size }), className)}
            {...props}
        />
    );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-description"
            className={cn('text-muted-foreground text-sm', className)}
            {...props}
        />
    );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
    return <div data-slot="card-content" className={cn('px-6', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-footer"
            className={cn('flex items-center px-6', className)}
            {...props}
        />
    );
}

/**
 * Custom Icon Component
 */
function CardIcon({ icon: Icon, ...props }: React.ComponentProps<'svg'> & { icon: IconType }) {
    return <Icon {...props} className="relative mb-6 h-6 w-6 text-primary" />;
}

/**
 * Custom Component for Card Actions on the top right of the card, usually used for buttons or dropdowns
 */
const CardAction = ({ children, className, ...props }: React.ComponentProps<'div'>) => {
    return (
        <div
            data-slot="card-action"
            className={cn('flex items-center gap-2 ml-auto', className)}
            {...props}
        >
            {children}
        </div>
    );
};

/**
 * Custom Component for Card that is used to navigate to a page
 */
const LinkCard = ({
    className,
    href,
    ...props
}: React.ComponentProps<'div'> & { href: RoutePath }) => {
    return (
        <Link href={href}>
            <Card
                className={cn('bg-transparent border-none shadow-none p-0', className)}
                {...props}
            ></Card>
        </Link>
    );
};

export {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardIcon,
    CardTitle,
    LinkCard,
};
