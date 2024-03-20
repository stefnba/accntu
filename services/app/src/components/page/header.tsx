import { Separator } from '@/components/ui/separator';
import { Breadcrumb, Breadcrumbs } from './breadcrumb';

interface PageHeaderProps {
    title: string;
    subTitle?: string;
    breadcrumbs?: Breadcrumb[];
}

export const PageHeader = ({
    title,
    subTitle,
    breadcrumbs
}: PageHeaderProps) => {
    return (
        <div className="mb-10 space-y-0.5">
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            {subTitle && <p className="text-muted-foreground">{subTitle}</p>}
        </div>
    );
};
