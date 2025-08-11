import { CardContent } from '@/components/ui/card';

export interface SummaryCardContentProps {
    children: React.ReactNode;
}

export function SummaryCardContent({ children }: SummaryCardContentProps) {
    return (
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-y-6">{children}</CardContent>
    );
}

export function SummaryCardSection({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col gap-1">{children}</div>;
}

export function SummaryCardLabel({ children }: { children: React.ReactNode }) {
    return <span className="text-sm text-muted-foreground">{children}</span>;
}

export function SummaryCardValue({ children }: { children: React.ReactNode }) {
    return <span className="font-medium">{children}</span>;
}
