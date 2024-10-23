import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRemoveTagFromTransaction } from '@/features/transaction/api/remove-tag';
import { SelectTagSchema } from '@features/tag/schema/get-tag';
import { X } from 'lucide-react';
import { z } from 'zod';

interface Props {
    tag: Omit<z.infer<typeof SelectTagSchema>, 'transactionCount'>;
    transactionId: string;
}

export const TransactionTag: React.FC<Props> = ({ tag, transactionId }) => {
    const { mutate } = useRemoveTagFromTransaction({ transactionId });

    const handleRemoveTag = () => {
        mutate({ tagId: tag.id, transactionId });
    };

    return (
        <Badge
            className="rounded-md px-3 group/tag hover:pr-1 flex items-center"
            style={{ backgroundColor: tag.color || 'black' }}
        >
            {tag.name}
            <Button
                variant="link"
                size="sm"
                className="text-white m-0 p-0 size-3 ml-1 hidden group-hover/tag:block"
                onClick={handleRemoveTag}
            >
                <X className="size-3" />
            </Button>
        </Badge>
    );
};
