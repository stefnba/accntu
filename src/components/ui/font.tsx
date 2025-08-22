import { cn } from '@/lib/utils';

/**
 * Title text
 */
export const Title = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return <h1 className={cn('text-2xl font-medium', className)}>{children}</h1>;
};

/**
 * Subtitle text
 */
export const Subtitle = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return <h2 className={cn('text-lg font-medium', className)}>{children}</h2>;
};

/**
 * Paragraph text
 */
export const Paragraph = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>;
};

/**
 * Header text
 */
export const Header = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return <h3 className={cn('text-base font-medium', className)}>{children}</h3>;
};

/**
 * Description text
 */
export const Description = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return <div className={cn('text-sm text-muted-foreground', className)}>{children}</div>;
};
