import { Description, Title } from '@/components/ui/font';

export interface PageHeaderProps {
    title: string;
    description?: string;
    actionBar?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    description,
    actionBar: ActionBar,
}) => {
    return (
        <div className="flex items-center mb-8">
            <div>
                <Title>{title}</Title>
                {description && <Description>{description}</Description>}
            </div>
            {ActionBar && <div className="ml-auto">{ActionBar} </div>}
        </div>
    );
};
