import {
    SettingsRow,
    SettingsRowActions,
    SettingsRowHeader,
    SettingsRowSection,
    SettingsRowTitle,
} from '@/components/settings-row';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useTransactionEndpoints } from '@/features/transaction/api';

export const AmountTab = ({ transactionId }: { transactionId: string }) => {
    const { data: transaction } = useTransactionEndpoints.getById({
        param: { id: transactionId },
    });

    if (!transaction) return null;

    return (
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
    );
};