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

export interface CardHeaderProps {
    title: string;
    description?: string | React.ReactElement | null;
    actionBar?: React.ReactNode;
    icon?: React.ReactNode;
}

/**
 * Card header
 */
export const CardHeader: React.FC<CardHeaderProps> = ({
    title,
    description,
    actionBar: ActionBar,
    icon,
}) => {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {icon && (
                            <div className="size-20 rounded-2xl flex items-center justify-center shadow-sm border">
                                {icon}
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-semibold text-gray-900 mb-2">{title}</h1>
                            <div className="flex items-center gap-4 text-gray-600 text-sm">
                                {description && <Description>{description}</Description>}
                            </div>
                        </div>
                    </div>

                    {ActionBar && <div className="ml-auto">{ActionBar}</div>}
                </div>
            </div>
        </div>
    );
};
