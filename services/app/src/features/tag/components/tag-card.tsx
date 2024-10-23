'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { storeViewUpdateTagSheet } from '@/features/tag/store/crud-tag-sheet';
import { cn } from '@/lib/utils';
import { TSelectTag } from '@features/tag/schema/get-tag';

interface Props {
    tag: TSelectTag;
}

/**
 * Card for displaying a tag.
 */
export const TagCard: React.FC<Props> = ({ tag }) => {
    const { handleOpen } = storeViewUpdateTagSheet();

    return (
        <Card
            style={{
                backgroundColor: tag.color || 'transparent',
                borderColor: tag.color || ''
            }}
            className="hover:shadow-md cursor-pointer hover:scale-[1.01] h-full"
            onClick={() => handleOpen({ id: tag.id })}
        >
            <CardHeader>
                <CardTitle
                    className={cn(
                        'text-lg font-semibold',
                        tag.color && 'text-white'
                    )}
                >
                    {tag.name}
                </CardTitle>
            </CardHeader>
        </Card>
    );
};
