import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface InfoCardProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Root wrapper component that provides the card container
 */
const InfoCardRoot = ({ children, className }: InfoCardProps) => {
    return <Card className={cn(className)}>{children}</Card>;
};

interface InfoCardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Header section for the info card title area
 */
const InfoCardHeader = ({ children, className }: InfoCardHeaderProps) => {
    return <CardHeader className={cn(className)}>{children}</CardHeader>;
};

interface InfoCardTitleProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Title component for the info card header
 */
const InfoCardTitle = ({ children, className }: InfoCardTitleProps) => {
    return (
        <CardTitle size="lg" className={cn(className)}>
            {children}
        </CardTitle>
    );
};

interface InfoCardContentProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Content area with responsive 2-column grid layout
 */
const InfoCardContent = ({ children, className }: InfoCardContentProps) => {
    return (
        <CardContent className={cn('grid grid-cols-1 md:grid-cols-2 gap-y-6', className)}>
            {children}
        </CardContent>
    );
};

interface InfoCardSectionProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Individual section for label-value pairs
 */
const InfoCardSection = ({ children, className }: InfoCardSectionProps) => {
    return <div className={cn('flex flex-col gap-1', className)}>{children}</div>;
};

interface InfoCardLabelProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Label component with muted styling for field names
 */
const InfoCardLabel = ({ children, className }: InfoCardLabelProps) => {
    return <span className={cn('text-sm text-muted-foreground', className)}>{children}</span>;
};

interface InfoCardValueProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Value component with medium font weight for field values
 */
const InfoCardValue = ({ children, className }: InfoCardValueProps) => {
    return <span className={cn('font-medium', className)}>{children}</span>;
};

interface InfoCardItem {
    label: string;
    value: React.ReactNode;
}

interface InfoCardAutoProps {
    title: string;
    items: InfoCardItem[];
    className?: string;
}

/**
 * Auto-layout component for quick info cards with title and items array
 */
const InfoCardAuto = ({ title, items, className }: InfoCardAutoProps) => {
    return (
        <InfoCardRoot className={className}>
            <InfoCardHeader>
                <InfoCardTitle>{title}</InfoCardTitle>
            </InfoCardHeader>
            <InfoCardContent>
                {items.map((item, index) => (
                    <InfoCardSection key={index}>
                        <InfoCardLabel>{item.label}</InfoCardLabel>
                        <InfoCardValue>{item.value}</InfoCardValue>
                    </InfoCardSection>
                ))}
            </InfoCardContent>
        </InfoCardRoot>
    );
};

/**
 * InfoCard - A flexible component for displaying key-value information in cards
 *
 * @example
 * // Compound Components (Full Flexibility)
 * <InfoCard>
 *   <InfoCard.Header>
 *     <InfoCard.Title>Metadata</InfoCard.Title>
 *   </InfoCard.Header>
 *   <InfoCard.Content>
 *     <InfoCard.Section>
 *       <InfoCard.Label>Date Created</InfoCard.Label>
 *       <InfoCard.Value>Aug 11, 2025, 7:21:11 pm</InfoCard.Value>
 *     </InfoCard.Section>
 *     <InfoCard.Section>
 *       <InfoCard.Label>Last Updated</InfoCard.Label>
 *       <InfoCard.Value>N/A</InfoCard.Value>
 *     </InfoCard.Section>
 *   </InfoCard.Content>
 * </InfoCard>
 *
 * @example
 * // Auto-layout API (Convenience)
 * <InfoCard.Auto
 *   title="Metadata"
 *   items={[
 *     { label: "Date Created", value: "Aug 11, 2025, 7:21:11 pm" },
 *     { label: "Last Updated", value: "N/A" },
 *     { label: "Transaction ID", value: "zqs7l0t0b4lx1q7s8yx96ult" },
 *     { label: "Import", value: "m5vtkt66g2vq3thjobkfk19x" }
 *   ]}
 * />
 */
export const InfoCard = Object.assign(InfoCardRoot, {
    Header: InfoCardHeader,
    Title: InfoCardTitle,
    Content: InfoCardContent,
    Section: InfoCardSection,
    Label: InfoCardLabel,
    Value: InfoCardValue,
    Auto: InfoCardAuto,
});

export {
    InfoCardContent,
    InfoCardHeader,
    InfoCardLabel,
    InfoCardSection,
    InfoCardTitle,
    InfoCardValue,
};
