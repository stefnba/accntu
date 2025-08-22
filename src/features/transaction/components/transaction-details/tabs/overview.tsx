import {
    InfoCard,
    InfoCardContent,
    InfoCardHeader,
    InfoCardLabel,
    InfoCardSection,
    InfoCardTitle,
    InfoCardValue,
} from '@/components/content/info-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { BankLogo } from '@/features/bank/components/bank-logo';
import { LabelBadge } from '@/features/label/components/label-badge';
import { TagBadge, tagBadgeVariants } from '@/features/tag/components/tag-badge';
import { TagSelectorModal } from '@/features/tag/components/tag-selector';
import { useTagSelectorModal } from '@/features/tag/hooks';
import { useTransactionEndpoints } from '@/features/transaction/api';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface OverviewTabProps {
    transactionId: string;
}

export const OverviewTab = ({ transactionId }: OverviewTabProps) => {
    const { data: transaction } = useTransactionEndpoints.getById({ param: { id: transactionId } });
    const { open } = useTagSelectorModal();

    console.log(tagBadgeVariants({ size: 'sm' }));

    return (
        <div className="grid grid-cols-2 gap-4">
            <Card>
                <CardContent>
                    <BankLogo
                        size="md"
                        logoUrl={transaction?.account?.connectedBank?.globalBank?.logo}
                        color={transaction?.account?.connectedBank?.globalBank?.color}
                    />
                    {transaction?.account?.connectedBank?.globalBank?.name}
                    {transaction?.account?.type}
                    {transaction?.account?.name}
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    {transaction?.label?.name || 'No Label'}
                    {transaction?.label?.color}

                    <LabelBadge
                        label={
                            transaction?.label
                                ? {
                                      ...transaction.label,
                                      color: transaction.label.color || '',
                                      icon: transaction.label.icon || '',
                                  }
                                : null
                        }
                    />
                </CardContent>
            </Card>

            <InfoCard className="col-span-2">
                <InfoCardHeader>
                    <InfoCardTitle>Information</InfoCardTitle>
                </InfoCardHeader>
                <InfoCardContent>
                    <InfoCardSection>
                        <InfoCardLabel>Tags</InfoCardLabel>
                        <InfoCardValue>Tags, Description, Type, Location, Notes,</InfoCardValue>
                    </InfoCardSection>
                    {/* Location */}
                    <InfoCardSection>
                        <InfoCardLabel>Location</InfoCardLabel>
                        <InfoCardValue>...</InfoCardValue>
                    </InfoCardSection>
                    <InfoCardSection className="group/tags">
                        <InfoCardLabel>Tags</InfoCardLabel>
                        <InfoCardValue className="flex flex-wrap gap-1">
                            {transaction?.tags?.map((tag) => (
                                <TagBadge key={tag.id} tag={tag} size="sm" />
                            ))}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            tagBadgeVariants({ size: 'sm' }),
                                            'hidden group-hover/tags:block transition-none'
                                        )}
                                        onClick={() =>
                                            open({
                                                transactionId: transactionId,
                                                tagsIds: transaction?.tags?.map((tag) => tag.id),
                                            })
                                        }
                                    >
                                        <Plus />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Add tag</TooltipContent>
                            </Tooltip>
                        </InfoCardValue>
                    </InfoCardSection>
                    <InfoCardSection className="flex flex-col gap-2">
                        <InfoCardLabel>Notes</InfoCardLabel>
                        <InfoCardValue>Tags, Description, Type, Location, Notes,</InfoCardValue>
                    </InfoCardSection>
                </InfoCardContent>
            </InfoCard>
            <TagSelectorModal />
        </div>
    );
};
