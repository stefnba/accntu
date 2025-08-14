import {
    InfoCard,
    InfoCardContent,
    InfoCardHeader,
    InfoCardLabel,
    InfoCardSection,
    InfoCardTitle,
    InfoCardValue,
} from '@/components/content/info-card';
import { Card, CardContent } from '@/components/ui/card';
import { BankLogo } from '@/features/bank/components/shared/logo';
import { LabelBadge } from '@/features/label/components/label-badge';
import { useTransactionEndpoints } from '@/features/transaction/api';

interface OverviewTabProps {
    transactionId: string;
}

export const OverviewTab = ({ transactionId }: OverviewTabProps) => {
    const { data: transaction } = useTransactionEndpoints.getById({ param: { id: transactionId } });

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

                    <LabelBadge label={transaction?.label} />
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
                    <InfoCardSection>
                        <InfoCardLabel>Tags</InfoCardLabel>
                        <InfoCardValue>Tags, Description, Type, Location, Notes,</InfoCardValue>
                    </InfoCardSection>
                    <InfoCardSection className="flex flex-col gap-2">
                        <InfoCardLabel>Notes</InfoCardLabel>
                        <InfoCardValue>Tags, Description, Type, Location, Notes,</InfoCardValue>
                    </InfoCardSection>
                </InfoCardContent>
            </InfoCard>
        </div>
    );
};
