import { QueryStateTabsNav } from '@/components/tabs-query-state';
import { useTransactionEndpoints } from '@/features/transaction/api';
import { useTransactionDetails } from '@/features/transaction/hooks/details';

interface TransactionTabsProps {
    transactionId: string;
}

export const TransactionTabs = ({ transactionId }: TransactionTabsProps) => {
    const tabsNav = useTransactionDetails();

    const { data: transaction } = useTransactionEndpoints.getById({
        param: { id: transactionId },
    });

    if (!transaction) return null;

    return (
        <QueryStateTabsNav
            tabsNav={tabsNav}
            render={({ tabs, Tab }) => (
                <>
                    {tabs.map((t) => (
                        <Tab value={t.value} key={t.value}>
                            {t.label}
                        </Tab>
                    ))}
                </>
            )}
        />
    );
};
