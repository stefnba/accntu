import {
    SummaryCardContent,
    SummaryCardLabel,
    SummaryCardSection,
    SummaryCardValue,
} from '@/components/summary-card-content';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactionEndpoints } from '@/features/transaction/api';
import { formatDate } from '@/lib/utils/date-formatter';

export const MetadataTab = ({ transactionId }: { transactionId: string }) => {
    const { data: transaction } = useTransactionEndpoints.getById({
        param: { id: transactionId },
    });

    if (!transaction) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Metadata</CardTitle>
            </CardHeader>

            <SummaryCardContent>
                <SummaryCardSection>
                    <SummaryCardLabel>Date Created</SummaryCardLabel>
                    <SummaryCardValue>
                        {formatDate(transaction.createdAt).format('SHORT_MONTH_DAY_YEAR_TIME')}
                    </SummaryCardValue>
                </SummaryCardSection>
                <SummaryCardSection>
                    <SummaryCardLabel>Last Updated</SummaryCardLabel>
                    <SummaryCardValue>
                        {formatDate(transaction.updatedAt).format('SHORT_MONTH_DAY_YEAR_TIME')}
                    </SummaryCardValue>
                </SummaryCardSection>
                <SummaryCardSection>
                    <SummaryCardLabel>Transaction ID</SummaryCardLabel>
                    <SummaryCardValue>{transaction.id}</SummaryCardValue>
                </SummaryCardSection>
                <SummaryCardSection>
                    <SummaryCardLabel>Import</SummaryCardLabel>
                    <SummaryCardValue>{transaction.importFileId}</SummaryCardValue>
                </SummaryCardSection>
            </SummaryCardContent>
        </Card>
    );
};
