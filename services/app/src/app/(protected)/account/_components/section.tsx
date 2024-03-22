import { Separator } from '@/components/ui/separator';

interface AccountSectionProps {
    title: string;
    subTitle?: string;
    action?: React.ReactElement;
}

export const AccountSection = ({
    title,
    subTitle,
    action: Action
}: AccountSectionProps) => {
    return (
        <div className="mr-6">
            <div className="my-6 flex content-center">
                <div className="my-auto">
                    <div className="text-lg">{title}</div>
                    {subTitle && (
                        <p className="text-md text-muted-foreground">
                            {subTitle}
                        </p>
                    )}
                </div>
                <div className="my-auto ml-auto cursor-pointer text-primary">
                    {Action}
                </div>
            </div>
            <Separator />
        </div>
    );
};
