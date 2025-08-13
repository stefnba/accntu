import { QueryStateTabsContent } from '@/components/tabs-query-state';

import {
    AmountTab,
    BankingTab,
    DetailsTab,
    MetadataTab,
    OverviewTab,
} from '@/features/transaction/components/transaction-details/tabs';
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
                overview: <OverviewTab transactionId={transactionId} />,
            }}
        />
    );
};
