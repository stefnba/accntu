import { QueryStateTabsContent } from '@/components/tabs-query-state';
import { AmountTab } from '@/features/transaction/components/transaction-details/amount-tab';
import { BankingTab } from '@/features/transaction/components/transaction-details/banking-tab';
import { DetailsTab } from '@/features/transaction/components/transaction-details/details-tab';
import { MetadataTab } from '@/features/transaction/components/transaction-details/metadata-tab';
import { useTransactionDetails } from '@/features/transaction/hooks/details';

export const TransactionDetailsTabContent = ({ transactionId }: { transactionId: string }) => {
    const tabsNav = useTransactionDetails();

    return (
        <QueryStateTabsContent
            tabs={tabsNav}
            components={{
                metadata: <MetadataTab transactionId={transactionId} />,
                amount: <AmountTab transactionId={transactionId} />,
                banking: <BankingTab transactionId={transactionId} />,
                details: <DetailsTab transactionId={transactionId} />,
            }}
        />
    );
};
