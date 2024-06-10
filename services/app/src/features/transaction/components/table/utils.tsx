import { Badge } from '@/components/ui/badge';
import dayjs from 'dayjs';

export const Amount = ({
    amountInCents,
    currency
}: {
    amountInCents: number;
    currency?: string;
}) => {
    return (
        <div className="text-right">
            {(amountInCents / 100).toLocaleString('en-US', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            })}{' '}
            {currency}
        </div>
    );
};

export const Date = ({ date }: { date: Date | string }) => {
    return <span>{dayjs(date).format('DD-MMM YY')}</span>;
};

export const TransactionType = ({ type }: { type: string }) => {
    if (type == 'DEBIT') {
        return (
            <Badge
                className="text-[#d4380d] bg-[#fff2e8] border-[#ffbb96] rounded font-normal"
                variant="outline"
            >
                Debit
            </Badge>
        );
    }

    if (type == 'TRANSFER') {
        return (
            <Badge
                className="text-[#1d39c4] bg-[#f0f5ff] border-[#adc6ff] rounded font-normal"
                variant="outline"
            >
                Transfer
            </Badge>
        );
    }

    return (
        <Badge
            className="text-[#389e0d] bg-[#f6ffed] border-[#b7eb8f] rounded font-normal"
            variant="outline"
        >
            Credit
        </Badge>
    );
};
