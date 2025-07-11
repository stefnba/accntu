import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TTagQuery } from '@/features/tag/schemas';
import { cn } from '@/lib/utils';
import { IconDotsVertical } from '@tabler/icons-react';

interface TagCardProps {
    className?: string;
    tag: TTagQuery['select'];
    onClick: () => void;
}

/**
 * A card component that displays a tag.
 * @param tag - The tag to display.
 * @param onClick - The function to call when the card is clicked.
 * @param className - The class name to apply to the card.
 * @returns A card component that displays a tag.
 */
export const TagCard: React.FC<TagCardProps> = ({ tag, onClick, className }) => {
    return (
        <div className={cn('flex items-center w-full', className)}>
            <div className="w-2 h-full rounded-l-md" style={{ backgroundColor: tag.color }} />

            <Card
                key={tag.id}
                className=" border-l-0 p-4 h-full w-full hover:shadow-md transition-shadow rounded-l-none"
                onClick={onClick}
            >
                <div className="flex items-center justify-between w-full">
                    <div className="font-medium truncate pr-2">{tag.name}</div>
                    <TagCardInfo>{tag.transactionCount || 0} transactions</TagCardInfo>
                    <TagCardActions>
                        <Button variant="ghost" size="icon">
                            <IconDotsVertical className="w-4 h-4" />
                        </Button>
                    </TagCardActions>
                </div>
            </Card>
        </div>
    );
};

interface TagCardInfoProps {
    children?: React.ReactNode;
}

export const TagCardInfo: React.FC<TagCardInfoProps> = ({ children }) => {
    return <div className="text-sm text-muted-foreground whitespace-nowrap">{children}</div>;
};

interface TagCardActionsProps {
    children?: React.ReactNode;
}

export const TagCardActions: React.FC<TagCardActionsProps> = ({ children }) => {
    return <div className="flex items-center justify-end flex-shrink-0">{children}</div>;
};

/**
 * A skeleton component that displays a tag card.
 * @returns A skeleton component that displays a tag card.
 */
export const TagCardSkeleton = () => {
    return (
        <div className="flex items-center">
            <div className="w-2 h-full rounded-l-md" />
            <Card className=" border-l-0 p-4 hover:shadow-md transition-shadow rounded-l-none" />
        </div>
    );
};
