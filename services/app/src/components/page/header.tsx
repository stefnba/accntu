import { Separator } from '@/components/ui/separator';

import { Breadcrumb, Breadcrumbs } from './breadcrumb';

interface PageHeaderProps {
    title: string;
    subTitle?: string;
    breadcrumbs?: Breadcrumb[];
    actionBar?: React.ReactNode;
}

export const PageHeader = ({
    title,
    subTitle,
    breadcrumbs,
    actionBar: ActionBar
}: PageHeaderProps) => {
    return (
        <div className="mb-10 space-y-0.5 flex items-center">
            <div>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
                <h2 className="text-3xl font-semibold tracking-tight">
                    {title}
                </h2>
                {subTitle && (
                    <p className="text-muted-foreground">{subTitle}</p>
                )}
            </div>
            <div className="ml-auto">{ActionBar && ActionBar}</div>
        </div>
    );
};
