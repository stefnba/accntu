import { Separator } from '@/components/ui/separator';

import { Button } from '../ui/button';
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
        <div className="mx-auto mt-2 mb-6 flex items-center">
            <div className="">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
                <h1 className="text-3xl font-semibold tracking-tight">
                    {title}
                </h1>
                {subTitle && (
                    <p className="text-muted-foreground">{subTitle}</p>
                )}
            </div>
            <div className="ml-auto">{ActionBar && ActionBar}</div>
        </div>
    );
};

interface HeaderActionButtonProps {
    onClick: () => void;
    icon?: any;
    label: string;
}

export const HeaderActionButton: React.FC<HeaderActionButtonProps> = ({
    onClick,
    icon: Icon,
    label
}) => {
    return (
        <Button variant="outline" size="sm" onClick={onClick}>
            {Icon && <Icon className="md:mr-2 md:size-4 size-5" />}
            <span className="hidden md:block">{label}</span>
        </Button>
    );
};
