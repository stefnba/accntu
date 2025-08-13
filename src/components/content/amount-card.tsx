import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface AmountCardProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Root wrapper component that provides the card container
 */
const AmountCardRoot = ({ children, className }: AmountCardProps) => {
    return <Card className={cn(className)}>{children}</Card>;
};

interface AmountCardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Header section for the amount card title area
 */
const AmountCardHeader = ({ children, className }: AmountCardHeaderProps) => {
    return <CardHeader className={cn(className)}>{children}</CardHeader>;
};

interface AmountCardTitleProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Title component for the amount card header
 */
const AmountCardTitle = ({ children, className }: AmountCardTitleProps) => {
    return <CardTitle className={cn(className)}>{children}</CardTitle>;
};

interface AmountCardContentProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Content area with spacing for amount items
 */
const AmountCardContent = ({ children, className }: AmountCardContentProps) => {
    return <CardContent className={cn('space-y-1', className)}>{children}</CardContent>;
};

interface AmountCardItemProps {
    children: React.ReactNode;
    className?: string;
    hoverable?: boolean;
}

/**
 * Individual amount item wrapper with hover and border styling
 */
const AmountCardItem = ({ children, className, hoverable = false }: AmountCardItemProps) => {
    return (
        <div
            className={cn(
                'flex items-center justify-between py-4 border-b border-gray-100 last:border-0 transition-colors',
                hoverable && 'hover:bg-gray-50',
                className
            )}
        >
            {children}
        </div>
    );
};

interface AmountCardIconProps {
    icon: LucideIcon;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
    className?: string;
}

/**
 * Icon component with variant-based styling
 */
const AmountCardIcon = ({ icon: Icon, variant = 'default', className }: AmountCardIconProps) => {
    return (
        <div
            className={cn(
                'p-2 rounded-full',
                variant === 'default' && 'bg-muted',
                variant === 'primary' && 'bg-primary/10',
                variant === 'success' && 'bg-green-50',
                variant === 'warning' && 'bg-yellow-50',
                variant === 'error' && 'bg-red-50',
                className
            )}
        >
            <Icon
                className={cn(
                    'h-4 w-4',
                    variant === 'default' && 'text-muted-foreground',
                    variant === 'primary' && 'text-primary',
                    variant === 'success' && 'text-green-600',
                    variant === 'warning' && 'text-yellow-600',
                    variant === 'error' && 'text-red-600'
                )}
            />
        </div>
    );
};

interface AmountCardBodyProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Body wrapper for icon, label, and description
 */
const AmountCardBody = ({ children, className }: AmountCardBodyProps) => {
    return <div className={cn('flex items-center gap-4', className)}>{children}</div>;
};

interface AmountCardLabelProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Label component for amount titles
 */
const AmountCardLabel = ({ children, className }: AmountCardLabelProps) => {
    return <p className={cn('font-medium text-gray-900', className)}>{children}</p>;
};

interface AmountCardDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Description component for additional info like dates or categories
 */
const AmountCardDescription = ({ children, className }: AmountCardDescriptionProps) => {
    return <div className={cn('text-sm text-gray-500', className)}>{children}</div>;
};

interface AmountCardValueProps {
    children: React.ReactNode;
    variant?: 'default' | 'positive' | 'negative' | 'primary';
    className?: string;
}

/**
 * Value wrapper for the right-aligned amount section
 */
const AmountCardValue = ({ children, variant = 'default', className }: AmountCardValueProps) => {
    return <div className={cn('text-right', className)}>{children}</div>;
};

interface AmountCardAmountProps {
    children: React.ReactNode;
    variant?: 'default' | 'positive' | 'negative' | 'primary';
    className?: string;
}

/**
 * Amount component with variant-based color styling
 */
const AmountCardAmount = ({ children, variant = 'default', className }: AmountCardAmountProps) => {
    return (
        <p
            className={cn(
                'font-semibold text-lg font-mono tabular-nums',
                variant === 'default' && 'text-foreground',
                variant === 'primary' && 'text-primary',
                variant === 'positive' && 'text-green-600',
                variant === 'negative' && 'text-red-600',
                className
            )}
        >
            {children}
        </p>
    );
};

interface AmountCardExchangeRateProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Exchange rate component similar to balance display
 */
const AmountCardExchangeRate = ({ children, className }: AmountCardExchangeRateProps) => {
    return <p className={cn('text-sm text-gray-500', className)}>{children}</p>;
};

interface AmountCardAutoItem {
    icon: LucideIcon;
    iconVariant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
    label: string;
    description?: string;
    amount: string;
    currency: string;
    amountVariant?: 'default' | 'positive' | 'negative' | 'primary';
    exchangeRate?: string;
    shareInfo?: string; // For budget sharing info like "50% shared with Sophia"
}

interface AmountCardAutoProps {
    title: string;
    items: AmountCardAutoItem[];
    className?: string;
    hoverable?: boolean;
}

/**
 * Auto-layout component for quick amount cards with transaction-row styling
 */
const AmountCardAuto = ({ title, items, className, hoverable = false }: AmountCardAutoProps) => {
    return (
        <AmountCardRoot className={className}>
            <AmountCardHeader>
                <AmountCardTitle>{title}</AmountCardTitle>
            </AmountCardHeader>
            <AmountCardContent>
                {items.map((item, index) => (
                    <AmountCardItem key={index} hoverable={hoverable}>
                        <AmountCardBody>
                            <AmountCardIcon icon={item.icon} variant={item.iconVariant} />
                            <div>
                                <AmountCardLabel>{item.label}</AmountCardLabel>
                                <AmountCardDescription>
                                    {item.description && <span>{item.description}</span>}
                                    {item.shareInfo && (
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            {item.shareInfo}
                                        </div>
                                    )}
                                </AmountCardDescription>
                            </div>
                        </AmountCardBody>
                        <AmountCardValue>
                            <AmountCardAmount variant={item.amountVariant}>
                                {item.currency} {item.amount}
                            </AmountCardAmount>
                            {item.exchangeRate && (
                                <AmountCardExchangeRate>{item.exchangeRate}</AmountCardExchangeRate>
                            )}
                        </AmountCardValue>
                    </AmountCardItem>
                ))}
            </AmountCardContent>
        </AmountCardRoot>
    );
};

/**
 * AmountCard - A flexible component for displaying financial amounts with transaction-row styling
 *
 * @example
 * // Compound Components (Full Flexibility)
 * <AmountCard>
 *   <AmountCard.Header>
 *     <AmountCard.Title>Amount Breakdown</AmountCard.Title>
 *   </AmountCard.Header>
 *   <AmountCard.Content>
 *     <AmountCard.Item>
 *       <AmountCard.Body>
 *         <AmountCard.Icon icon={DollarSign} variant="primary" />
 *         <div>
 *           <AmountCard.Label>Spending Amount</AmountCard.Label>
 *           <AmountCard.Description>Transaction currency</AmountCard.Description>
 *         </div>
 *       </AmountCard.Body>
 *       <AmountCard.Value>
 *         <AmountCard.Amount variant="primary">CHF 33.23</AmountCard.Amount>
 *         <AmountCard.ExchangeRate>1 CHF = 1.1 USD</AmountCard.ExchangeRate>
 *       </AmountCard.Value>
 *     </AmountCard.Item>
 *   </AmountCard.Content>
 * </AmountCard>
 *
 * @example
 * // Auto-layout API (Convenience)
 * <AmountCard.Auto
 *   title="Amount Breakdown"
 *   items={[
 *     {
 *       icon: DollarSign,
 *       iconVariant: "primary",
 *       label: "Spending Amount",
 *       description: "Transaction currency",
 *       amount: "33.23",
 *       currency: "CHF",
 *       amountVariant: "primary",
 *       exchangeRate: "1 CHF = 1.1 USD"
 *     },
 *     {
 *       icon: Target,
 *       iconVariant: "default",
 *       label: "Budget Amount",
 *       description: "Allocated budget",
 *       amount: "50.00",
 *       currency: "EUR",
 *       shareInfo: "50% shared with Sophia"
 *     }
 *   ]}
 * />
 */
export const AmountCard = Object.assign(AmountCardRoot, {
    Header: AmountCardHeader,
    Title: AmountCardTitle,
    Content: AmountCardContent,
    Item: AmountCardItem,
    Icon: AmountCardIcon,
    Body: AmountCardBody,
    Label: AmountCardLabel,
    Description: AmountCardDescription,
    Value: AmountCardValue,
    Amount: AmountCardAmount,
    ExchangeRate: AmountCardExchangeRate,
    Auto: AmountCardAuto,
});

export {
    AmountCardAmount,
    AmountCardBody,
    AmountCardContent,
    AmountCardDescription,
    AmountCardExchangeRate,
    AmountCardHeader,
    AmountCardIcon,
    AmountCardItem,
    AmountCardLabel,
    AmountCardTitle,
    AmountCardValue,
};
