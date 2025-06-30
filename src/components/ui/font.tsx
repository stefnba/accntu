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
export const Subtitle = ({ children }: { children: React.ReactNode }) => {
    return <h2 className="text-lg font-medium">{children}</h2>;
};

/**
 * Paragraph text
 */
export const Paragraph = ({ children }: { children: React.ReactNode }) => {
    return <p className="text-sm text-muted-foreground">{children}</p>;
};

/**
 * Header text
 */
export const Header = ({ children }: { children: React.ReactNode }) => {
    return <h3 className="text-base font-medium">{children}</h3>;
};

/**
 * Description text
 */
export const Description = ({ children }: { children: React.ReactNode }) => {
    return <p className="text-sm text-muted-foreground">{children}</p>;
};
