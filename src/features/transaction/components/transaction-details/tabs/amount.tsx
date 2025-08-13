import { AmountCard } from '@/components/content';
import { useTransactionEndpoints } from '@/features/transaction/api';
import { getAmountWithSign } from '@/features/transaction/utils';
import { CreditCard, DollarSign, Target, User } from 'lucide-react';

export const AmountTab = ({ transactionId }: { transactionId: string }) => {
    const { data: transaction } = useTransactionEndpoints.getById({
        param: { id: transactionId },
    });

    if (!transaction) return null;

    // Mock data - replace with actual transaction data
    const amountData = [
        {
            icon: DollarSign,
            iconVariant: 'primary' as const,
            label: 'Spending Amount',
            amount: String(getAmountWithSign(transaction.spendingAmount, transaction.type)),
            currency: 'CHF',
            amountVariant: 'primary' as const,
            exchangeRate: 'Exchange: 1 CHF = 1.1 USD',
        },
        {
            icon: CreditCard,
            iconVariant: 'default' as const,
            label: 'Account Amount',

            amount: '33.31',
            currency: 'EUR',
            amountVariant: 'default' as const,
            exchangeRate: 'Exchange: 1 EUR = 1.2 CHF',
        },
        {
            icon: User,
            iconVariant: 'default' as const,
            label: 'User Amount',

            amount: '33.31',
            currency: 'EUR',
            amountVariant: 'default' as const,
            exchangeRate: 'Exchange: 1 EUR = 1.2 CHF',
        },
        {
            icon: Target,
            iconVariant: 'default' as const,
            label: 'Budget Amount',
            // description: 'Allocated budget',
            amount: '33.31',
            currency: 'EUR',
            amountVariant: 'default' as const,
            exchangeRate: 'Exchange: 1 EUR = 1.2 CHF',
            shareInfo: '50% shared with Sophia',
        },
    ];

    return <AmountCard.Auto title="Amount" items={amountData} />;
};
