import {
    SettingsRow,
    SettingsRowActions,
    SettingsRowHeader,
    SettingsRowSection,
    SettingsRowTitle,
} from '@/components/settings-row';
import { QueryStateTabsContent } from '@/components/tabs-query-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BankingTab } from '@/features/transaction/components/transaction-details/banking-tab';
import { DetailsTab } from '@/features/transaction/components/transaction-details/details-tab';
import { MetadataTab } from '@/features/transaction/components/transaction-details/metadata-tab';
import { useTransactionDetails } from '@/features/transaction/hooks/details';

export const TransactionDetailsTabContent = ({ transactionId }: { transactionId: string }) => {
    const tabsNav = useTransactionDetails();

    return (
        <div>
            <QueryStateTabsContent
                tabs={tabsNav}
                components={{
                    amount: (
                        <Card>
                            <CardHeader>
                                <CardTitle>Amount</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Separator />
                                <SettingsRowSection>
                                    <SettingsRow>
                                        <SettingsRowHeader>
                                            <SettingsRowTitle>Spending Amount</SettingsRowTitle>
                                        </SettingsRowHeader>
                                        <SettingsRowActions>CHF 33.23</SettingsRowActions>
                                    </SettingsRow>
                                    <SettingsRow>
                                        <SettingsRowHeader>
                                            <SettingsRowTitle>Account Amount</SettingsRowTitle>
                                        </SettingsRowHeader>
                                        <SettingsRowActions>EUR 33.31</SettingsRowActions>
                                    </SettingsRow>
                                    <SettingsRow>
                                        <SettingsRowHeader>
                                            <SettingsRowTitle>Account Amount</SettingsRowTitle>
                                        </SettingsRowHeader>
                                        <SettingsRowActions>EUR 33.31</SettingsRowActions>
                                    </SettingsRow>
                                    <SettingsRow>
                                        <SettingsRowHeader>
                                            <SettingsRowTitle>Account Amount</SettingsRowTitle>
                                        </SettingsRowHeader>
                                        <SettingsRowActions>EUR 33.31</SettingsRowActions>
                                    </SettingsRow>
                                </SettingsRowSection>
                            </CardContent>
                        </Card>
                    ),
                    details: <DetailsTab transactionId={transactionId} />,
                    banking: <BankingTab transactionId={transactionId} />,
                    metadata: <MetadataTab transactionId={transactionId} />,
                }}
            />
        </div>
    );
};
