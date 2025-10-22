import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { EllipsisVerticalIcon } from 'lucide-react';
import { Route } from 'next';
import Link, { LinkProps } from 'next/link';

// ============================================
// Root
// ============================================

interface BankCardProps<T extends Route> {
    children: React.ReactNode;
    className?: string;
    href: LinkProps<T>['href'];
}

/**
 * Root wrapper component that provides the card container
 */
const BankCardRoot = <T extends Route>({ children, className, href }: BankCardProps<T>) => {
    const card = (
        <Card
            className={cn(
                'p-6 gap-4 flex group items-center flex-row transition-all duration-200 hover:shadow-lg hover:shadow-gray-100 border-gray-200 hover:scale-101',
                className
            )}
        >
            {children}
        </Card>
    );

    if (href) {
        return (
            <Link href={href} className="block">
                {card}
            </Link>
        );
    }

    return card;
};

// ============================================
// Icon
// ============================================

interface BankCardIconProps {
    children: React.ReactNode;
    className?: string;
}

const BankCardIcon = ({ children, className }: BankCardIconProps) => {
    return <div className={cn('justify-start', className)}>{children}</div>;
};

// ============================================
// Header
// ============================================

interface BankCardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

const BankCardHeader = ({ children, className }: BankCardHeaderProps) => {
    return <CardHeader className={cn('flex-1 p-0', className)}>{children}</CardHeader>;
};

// ============================================
// Title
// ============================================

interface BankCardTitleProps {
    children: React.ReactNode;
    className?: string;
}

const BankCardTitle = ({ children, className }: BankCardTitleProps) => {
    return (
        <CardTitle size="lg" className={cn('p-0', className)}>
            {children}
        </CardTitle>
    );
};

// ============================================
// Description
// ============================================

interface BankCardDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

const BankCardDescription = ({ children, className }: BankCardDescriptionProps) => {
    return <CardDescription className={cn('', className)}>{children}</CardDescription>;
};

// ============================================
// Content
// ============================================

// ============================================
// Actions
// ============================================

interface BankCardActionsProps {
    children: React.ReactNode;
    className?: string;
}

const BankCardActions = ({ children, className }: BankCardActionsProps) => {
    return <div className={cn('justify-end', className)}>{children}</div>;
};

interface BankCardActionsDropdownProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

const BankCardActionsDropdown = ({
    children,
    className,
    title = 'Actions',
}: BankCardActionsDropdownProps) => {
    return (
        <BankCardActions>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <EllipsisVerticalIcon className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className={cn('w-56', className)}>
                    {title && <DropdownMenuLabel>{title}</DropdownMenuLabel>}
                    {children}
                </DropdownMenuContent>
            </DropdownMenu>
        </BankCardActions>
    );
};

// ============================================
// Export
// ============================================

export const BankCard = Object.assign(BankCardRoot, {
    Icon: BankCardIcon,
    Header: BankCardHeader,
    Title: BankCardTitle,
    Description: BankCardDescription,
    Actions: BankCardActions,
    ActionsDropdown: BankCardActionsDropdown,
});
