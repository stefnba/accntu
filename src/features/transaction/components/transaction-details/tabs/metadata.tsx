import { InfoCard } from '@/components/content';
import { useTransactionEndpoints } from '@/features/transaction/api';
import { formatDate } from '@/lib/utils/date-formatter';

export const MetadataTab = ({ transactionId }: { transactionId: string }) => {
    const { data: transaction } = useTransactionEndpoints.getById({
        param: { id: transactionId },
    });

    if (!transaction) return null;

    return (
        <InfoCard.Auto
            title="Metadata"
            items={[
                {
                    label: 'Date Created',
                    value: formatDate(transaction.createdAt).format('SHORT_MONTH_DAY_YEAR_TIME'),
                },
                {
                    label: 'Last Updated',
                    value: formatDate(transaction.updatedAt).format('SHORT_MONTH_DAY_YEAR_TIME'),
                },
                { label: 'Transaction ID', value: transaction.id },
                { label: 'Import', value: transaction.importFileId },
            ]}
        />
    );
};
